import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantityRequired: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be positive'],
  },
  isOptional: {
    type: Boolean,
    default: false,
  },
  name: String, // Denormalized for quick access
});

const configurableProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Configurable product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    components: [componentSchema],
    // Calculated fields
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    margin: {
      type: Number,
      default: 0,
    },
    // Manual price override (optional)
    customPrice: {
      type: Number,
      min: [0, 'Custom price cannot be negative'],
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // SEO fields
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    keywords: [String],
    // Instructions for workshop
    productionNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
configurableProductSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Method to calculate total price from components
configurableProductSchema.methods.calculatePrice = async function () {
  await this.populate('components.product');

  let totalPrice = 0;
  let totalCost = 0;

  this.components.forEach((component) => {
    if (component.product) {
      totalPrice += component.product.price * component.quantityRequired;
      totalCost += component.product.cost * component.quantityRequired;
    }
  });

  this.totalPrice = totalPrice;
  this.totalCost = totalCost;
  this.margin = ((totalPrice - totalCost) / totalPrice) * 100 || 0;

  return {
    totalPrice: this.totalPrice,
    totalCost: this.totalCost,
    margin: this.margin,
  };
};

// Method to check if all components are in stock
configurableProductSchema.methods.checkComponentsStock = async function (quantity = 1) {
  await this.populate('components.product');

  const stockIssues = [];

  this.components.forEach((component) => {
    const requiredStock = component.quantityRequired * quantity;
    if (component.product && component.product.stock < requiredStock) {
      stockIssues.push({
        productName: component.product.name,
        required: requiredStock,
        available: component.product.stock,
      });
    }
  });

  return {
    inStock: stockIssues.length === 0,
    issues: stockIssues,
  };
};

// Get the final selling price (custom or calculated)
configurableProductSchema.virtual('finalPrice').get(function () {
  return this.customPrice || this.totalPrice;
});

configurableProductSchema.set('toJSON', { virtuals: true });
configurableProductSchema.set('toObject', { virtuals: true });

const ConfigurableProduct = mongoose.model('ConfigurableProduct', configurableProductSchema);

export default ConfigurableProduct;

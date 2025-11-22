import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'gram', 'piece', 'litre', 'pack', 'meter', 'cm', 'sqm', 'other'],
      default: 'piece',
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
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
    // For future catalog use
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Check if stock is low
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;

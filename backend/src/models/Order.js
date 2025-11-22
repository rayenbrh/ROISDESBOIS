import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    enum: ['regular', 'configurable'],
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'items.productModel',
  },
  productModel: {
    type: String,
    enum: ['Product', 'ConfigurableProduct'],
  },
  name: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  total: {
    type: Number,
    required: true,
  },
  // For configurable products - store component breakdown
  components: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      quantityRequired: Number,
    },
  ],
  customizations: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // Customer information
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
    // Order items
    items: [orderItemSchema],
    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'check', 'other'],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    // Dates
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    // Notes
    notes: {
      type: String,
    },
    internalNotes: {
      type: String,
    },
    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Find the last order of this month
    const lastOrder = await mongoose.model('Order').findOne({
      orderNumber: new RegExp(`^ORD-${year}${month}`),
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.orderNumber = `ORD-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Calculate balance remaining
orderSchema.virtual('balanceRemaining').get(function () {
  return this.total - this.amountPaid;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;

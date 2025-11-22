import mongoose from 'mongoose';

const posItemSchema = new mongoose.Schema({
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
  discount: {
    type: Number,
    default: 0,
  },
});

const posSaleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // Items sold
    items: [posItemSchema],
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
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'other'],
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      default: 0,
    },
    // Customer (optional for POS)
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    // Notes
    notes: {
      type: String,
    },
    // Tracking
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Status
    status: {
      type: String,
      enum: ['completed', 'refunded', 'partial_refund'],
      default: 'completed',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate sale number
posSaleSchema.pre('save', async function (next) {
  if (!this.saleNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Find the last sale of today
    const lastSale = await mongoose.model('POSSale').findOne({
      saleNumber: new RegExp(`^POS-${year}${month}${day}`),
    }).sort({ saleNumber: -1 });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.saleNumber = `POS-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

const POSSale = mongoose.model('POSSale', posSaleSchema);

export default POSSale;

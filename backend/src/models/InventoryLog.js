import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'manual_adjustment',
        'sale',
        'order',
        'pos_sale',
        'refund',
        'damage',
        'initial_stock',
        'restock',
      ],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    // Reference to the document that caused this change
    reference: {
      model: {
        type: String,
        enum: ['Order', 'POSSale', 'User'],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
inventoryLogSchema.index({ product: 1, createdAt: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog;

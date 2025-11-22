import mongoose, { Schema } from 'mongoose';
import { IInventoryLog } from '../types';

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    subProductId: {
      type: Schema.Types.ObjectId,
      ref: 'SubProduct'
    },
    variantId: {
      type: String
    },
    adjustmentType: {
      type: String,
      enum: ['manual', 'sale', 'return', 'production'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes
inventoryLogSchema.index({ productId: 1 });
inventoryLogSchema.index({ subProductId: 1 });
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ performedBy: 1 });

export const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);

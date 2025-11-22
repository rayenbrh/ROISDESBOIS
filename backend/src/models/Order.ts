import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus, OrderSource } from '../types';

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    commercialId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    source: {
      type: String,
      enum: Object.values(OrderSource),
      default: OrderSource.ADMIN
    },
    lines: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        productTitle: {
          ar: { type: String, required: true }
        },
        variantId: String,
        componentSelections: {
          type: Schema.Types.Mixed // { componentKey: subProductId }
        },
        unitPrice: { type: Number, required: true, min: 0 },
        qty: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true, min: 0 },
        costPerUnit: { type: Number, min: 0 }
      }
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    remise: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    costTotal: {
      type: Number,
      min: 0
    },
    netIncome: {
      type: Number
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEW,
      index: true
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    shippingDate: {
      type: Date
    },
    productionSheetPath: {
      type: String
    },
    notes: {
      type: String
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(OrderStatus),
          required: true
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ clientId: 1 });
orderSchema.index({ commercialId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ source: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

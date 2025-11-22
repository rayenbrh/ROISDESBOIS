import mongoose, { Schema } from 'mongoose';
import { IInvoice } from '../types';

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    commercialId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true
    },
    dueDate: {
      type: Date
    },
    payments: [
      {
        date: { type: Date, required: true, default: Date.now },
        amount: { type: Number, required: true, min: 0 },
        method: { type: String, required: true },
        note: String,
        recordedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    pdfPath: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ isPaid: 1 });
invoiceSchema.index({ createdAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

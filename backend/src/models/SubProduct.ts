import mongoose, { Schema } from 'mongoose';
import { ISubProduct } from '../types';

const subProductSchema = new Schema<ISubProduct>(
  {
    title: {
      ar: { type: String, required: true, trim: true }
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    images: [
      {
        path: { type: String, required: true },
        thumbPath: { type: String, required: true },
        width: Number,
        height: Number,
        alt: {
          ar: String,
          en: String
        }
      }
    ],
    extraPrice: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
subProductSchema.index({ sku: 1 });
subProductSchema.index({ 'title.ar': 'text' });
subProductSchema.index({ stock: 1 });

export const SubProduct = mongoose.model<ISubProduct>('SubProduct', subProductSchema);

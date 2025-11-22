import mongoose, { Schema } from 'mongoose';
import { IProduct, StockPolicy, CompositeMode } from '../types';

const productSchema = new Schema<IProduct>(
  {
    title: {
      ar: { type: String, required: true, trim: true }
    },
    description: {
      ar: { type: String, trim: true }
    },
    sku: {
      type: String,
      required: true,
      unique: true,
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
    variants: [
      {
        color: {
          ar: { type: String, required: true }
        },
        sku: { type: String, required: true },
        image: String,
        stock: { type: Number, default: 0, min: 0 }
      }
    ],
    price: {
      retail: { type: Number, required: true, min: 0 },
      bulkPrices: [
        {
          minQty: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 }
        }
      ]
    },
    cost: {
      type: Number,
      min: 0
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    isSpecial: {
      type: Boolean,
      default: false
    },
    specialConfig: {
      components: [
        {
          componentKey: { type: String, required: true },
          label: {
            ar: { type: String, required: true }
          },
          subProductIds: [
            {
              type: Schema.Types.ObjectId,
              ref: 'SubProduct'
            }
          ],
          required: { type: Boolean, default: true }
        }
      ],
      combinationImages: [
        {
          mapping: { type: Schema.Types.Mixed, required: true },
          imagePath: { type: String, required: true }
        }
      ],
      compositeMode: {
        type: String,
        enum: Object.values(CompositeMode),
        default: CompositeMode.MANUAL
      }
    },
    stockPolicy: {
      type: String,
      enum: Object.values(StockPolicy),
      default: StockPolicy.BY_PRODUCT
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    meta: {
      title: {
        ar: String,
        en: String
      },
      description: {
        ar: String,
        en: String
      },
      keywords: {
        ar: String,
        en: String
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ 'title.ar': 'text', 'description.ar': 'text' });
productSchema.index({ categories: 1 });
productSchema.index({ isSpecial: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ stock: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

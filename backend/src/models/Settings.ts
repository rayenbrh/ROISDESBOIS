import mongoose, { Schema } from 'mongoose';
import { ISettings } from '../types';

const settingsSchema = new Schema<ISettings>(
  {
    companyName: {
      ar: { type: String, required: true },
      en: String
    },
    logoPath: {
      type: String
    },
    address: {
      ar: String,
      en: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    },
    taxNumber: {
      type: String
    },
    taxPercent: {
      type: Number,
      default: 19,
      min: 0,
      max: 100
    },
    currency: {
      type: String,
      default: 'TND'
    },
    invoiceFooter: {
      ar: String,
      en: String
    },
    defaultLanguage: {
      type: String,
      default: 'ar'
    },
    theme: {
      primaryColor: { type: String, default: '#D4AF37' },
      mode: { type: String, enum: ['light', 'dark'], default: 'light' }
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

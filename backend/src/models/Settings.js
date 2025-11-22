import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // Company Information
    companyName: {
      type: String,
      default: 'Les Rois des Bois',
    },
    logo: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Business Settings
    currency: {
      type: String,
      default: 'DZD',
    },
    taxRate: {
      type: Number,
      default: 19,
      min: 0,
      max: 100,
    },
    language: {
      type: String,
      default: 'ar',
      enum: ['ar', 'fr', 'en'],
    },
    // Invoice Settings
    invoicePrefix: {
      type: String,
      default: 'INV',
    },
    invoiceFooter: {
      type: String,
      default: 'شكراً لتعاملكم معنا',
    },
    // Email Settings (for future)
    emailNotifications: {
      type: Boolean,
      default: false,
    },
    // Low Stock Alert
    lowStockAlert: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    // Working Hours
    workingHours: {
      from: {
        type: String,
        default: '08:00',
      },
      to: {
        type: String,
        default: '18:00',
      },
    },
    // Social Media
    socialMedia: {
      facebook: String,
      instagram: String,
      whatsapp: String,
    },
    // System Settings
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

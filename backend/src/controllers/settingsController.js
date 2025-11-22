import { Settings } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();

    // Update allowed fields
    const allowedFields = [
      'companyName',
      'phone',
      'email',
      'address',
      'currency',
      'taxRate',
      'language',
      'invoicePrefix',
      'invoiceFooter',
      'emailNotifications',
      'lowStockAlert',
      'lowStockThreshold',
      'workingHours',
      'socialMedia',
      'maintenanceMode',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private/Admin
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    let settings = await Settings.getSettings();

    // Delete old logo if exists
    if (settings.logo) {
      const oldLogoPath = path.join(__dirname, '../../', settings.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Save new logo path
    settings.logo = `/uploads/${req.file.filename}`;
    await settings.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { settings },
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
    });
  }
};

// @desc    Delete logo
// @route   DELETE /api/settings/logo
// @access  Private/Admin
export const deleteLogo = async (req, res) => {
  try {
    let settings = await Settings.getSettings();

    if (settings.logo) {
      const logoPath = path.join(__dirname, '../../', settings.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }

      settings.logo = '';
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Logo deleted successfully',
      data: { settings },
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
    });
  }
};

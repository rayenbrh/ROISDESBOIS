import { Request, Response, NextFunction } from 'express';
import { Settings } from '../models';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logUpdate } from '../services/auditService';
import { processImage, deleteImage } from '../services/imageService';
import logger from '../config/logger';
import path from 'path';

/**
 * Get settings
 * GET /api/admin/settings
 */
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({
        companyName: { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
        taxPercent: 19,
        currency: 'TND',
        defaultLanguage: 'ar'
      });
      await settings.save();
    }

    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings
 * PUT /api/admin/settings
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      companyName,
      address,
      phone,
      email,
      taxNumber,
      taxPercent,
      currency,
      invoiceFooter,
      defaultLanguage,
      theme
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = new Settings({
        companyName: companyName || { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
        taxPercent: taxPercent || 19,
        currency: currency || 'TND',
        defaultLanguage: defaultLanguage || 'ar'
      });
    }

    // Update fields
    if (companyName) settings.companyName = companyName;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (taxNumber !== undefined) settings.taxNumber = taxNumber;
    if (taxPercent !== undefined) settings.taxPercent = taxPercent;
    if (currency) settings.currency = currency;
    if (invoiceFooter !== undefined) settings.invoiceFooter = invoiceFooter;
    if (defaultLanguage) settings.defaultLanguage = defaultLanguage;
    if (theme !== undefined) settings.theme = theme;

    await settings.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'settings', settings._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`Settings updated by ${req.user?.email}`);

    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload company logo
 * POST /api/admin/settings/logo
 */
export const uploadLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400, 'NO_FILE');
      return;
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        companyName: { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
        taxPercent: 19,
        currency: 'TND',
        defaultLanguage: 'ar'
      });
    }

    // Delete old logo if exists
    if (settings.logoPath) {
      await deleteImage(settings.logoPath);
    }

    // Process new logo
    const outputDir = path.join('uploads', 'settings');
    const processedImage = await processImage(req.file.path, outputDir);

    settings.logoPath = processedImage.path;
    await settings.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'settings', settings._id.toString(), {
        action: 'logo_uploaded'
      });
    }

    logger.info(`Company logo uploaded by ${req.user?.email}`);

    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete company logo
 * DELETE /api/admin/settings/logo
 */
export const deleteLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await Settings.findOne();

    if (!settings || !settings.logoPath) {
      sendError(res, 'No logo to delete', 404, 'NO_LOGO');
      return;
    }

    // Delete logo file
    await deleteImage(settings.logoPath);

    settings.logoPath = undefined;
    await settings.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'settings', settings._id.toString(), {
        action: 'logo_deleted'
      });
    }

    logger.info(`Company logo deleted by ${req.user?.email}`);

    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

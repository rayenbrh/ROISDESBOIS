"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLogo = exports.uploadLogo = exports.updateSettings = exports.getSettings = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const imageService_1 = require("../services/imageService");
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
/**
 * Get settings
 * GET /api/admin/settings
 */
const getSettings = async (_req, res, next) => {
    try {
        let settings = await models_1.Settings.findOne();
        // Create default settings if none exist
        if (!settings) {
            settings = new models_1.Settings({
                companyName: { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
                taxPercent: 19,
                currency: 'TND',
                defaultLanguage: 'ar'
            });
            await settings.save();
        }
        (0, apiResponse_1.sendSuccess)(res, settings);
    }
    catch (error) {
        next(error);
    }
};
exports.getSettings = getSettings;
/**
 * Update settings
 * PUT /api/admin/settings
 */
const updateSettings = async (req, res, next) => {
    try {
        const { companyName, address, phone, email, taxNumber, taxPercent, currency, invoiceFooter, defaultLanguage, theme } = req.body;
        let settings = await models_1.Settings.findOne();
        if (!settings) {
            // Create new settings if none exist
            settings = new models_1.Settings({
                companyName: companyName || { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
                taxPercent: taxPercent || 19,
                currency: currency || 'TND',
                defaultLanguage: defaultLanguage || 'ar'
            });
        }
        // Update fields
        if (companyName)
            settings.companyName = companyName;
        if (address !== undefined)
            settings.address = address;
        if (phone !== undefined)
            settings.phone = phone;
        if (email !== undefined)
            settings.email = email;
        if (taxNumber !== undefined)
            settings.taxNumber = taxNumber;
        if (taxPercent !== undefined)
            settings.taxPercent = taxPercent;
        if (currency)
            settings.currency = currency;
        if (invoiceFooter !== undefined)
            settings.invoiceFooter = invoiceFooter;
        if (defaultLanguage)
            settings.defaultLanguage = defaultLanguage;
        if (theme !== undefined)
            settings.theme = theme;
        await settings.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'settings', settings._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`Settings updated by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, settings);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
/**
 * Upload company logo
 * POST /api/admin/settings/logo
 */
const uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            (0, apiResponse_1.sendError)(res, 'No file uploaded', 400, 'NO_FILE');
            return;
        }
        let settings = await models_1.Settings.findOne();
        if (!settings) {
            settings = new models_1.Settings({
                companyName: { ar: 'Les Rois des Bois', en: 'Les Rois des Bois' },
                taxPercent: 19,
                currency: 'TND',
                defaultLanguage: 'ar'
            });
        }
        // Delete old logo if exists
        if (settings.logoPath) {
            await (0, imageService_1.deleteImage)(settings.logoPath);
        }
        // Process new logo
        const outputDir = path_1.default.join('uploads', 'settings');
        const processedImage = await (0, imageService_1.processImage)(req.file.path, outputDir);
        settings.logoPath = processedImage.path;
        await settings.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'settings', settings._id.toString(), {
                action: 'logo_uploaded'
            });
        }
        logger_1.default.info(`Company logo uploaded by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, settings);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadLogo = uploadLogo;
/**
 * Delete company logo
 * DELETE /api/admin/settings/logo
 */
const deleteLogo = async (req, res, next) => {
    try {
        const settings = await models_1.Settings.findOne();
        if (!settings || !settings.logoPath) {
            (0, apiResponse_1.sendError)(res, 'No logo to delete', 404, 'NO_LOGO');
            return;
        }
        // Delete logo file
        await (0, imageService_1.deleteImage)(settings.logoPath);
        settings.logoPath = undefined;
        await settings.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'settings', settings._id.toString(), {
                action: 'logo_deleted'
            });
        }
        logger_1.default.info(`Company logo deleted by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, settings);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLogo = deleteLogo;
//# sourceMappingURL=settingsController.js.map
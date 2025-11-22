import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';
import { localizedStringSchema } from '../middleware/validate';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const updateSettingsSchema = Joi.object({
  companyName: localizedStringSchema,
  address: localizedStringSchema,
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  taxNumber: Joi.string().allow('', null),
  taxPercent: Joi.number().min(0).max(100),
  currency: Joi.string().length(3),
  invoiceFooter: localizedStringSchema,
  defaultLanguage: Joi.string().valid('ar', 'en', 'fr'),
  theme: Joi.object({
    primaryColor: Joi.string().allow('', null),
    mode: Joi.string().valid('light', 'dark')
  })
});

/**
 * @route   GET /api/admin/settings
 * @desc    Get settings
 * @access  Private (Admin only)
 */
router.get('/', settingsController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update settings
 * @access  Private (Admin only)
 */
router.put('/', validate(updateSettingsSchema), settingsController.updateSettings);

/**
 * @route   POST /api/admin/settings/logo
 * @desc    Upload company logo
 * @access  Private (Admin only)
 */
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);

/**
 * @route   DELETE /api/admin/settings/logo
 * @desc    Delete company logo
 * @access  Private (Admin only)
 */
router.delete('/logo', settingsController.deleteLogo);

export default router;

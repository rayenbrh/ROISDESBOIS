"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController = __importStar(require("../controllers/settingsController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const updateSettingsSchema = joi_1.default.object({
    companyName: validate_2.localizedStringSchema,
    address: validate_2.localizedStringSchema,
    phone: joi_1.default.string().allow('', null),
    email: joi_1.default.string().email().allow('', null),
    taxNumber: joi_1.default.string().allow('', null),
    taxPercent: joi_1.default.number().min(0).max(100),
    currency: joi_1.default.string().length(3),
    invoiceFooter: validate_2.localizedStringSchema,
    defaultLanguage: joi_1.default.string().valid('ar', 'en', 'fr'),
    theme: joi_1.default.object({
        primaryColor: joi_1.default.string().allow('', null),
        mode: joi_1.default.string().valid('light', 'dark')
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
router.put('/', (0, validate_1.validate)(updateSettingsSchema), settingsController.updateSettings);
/**
 * @route   POST /api/admin/settings/logo
 * @desc    Upload company logo
 * @access  Private (Admin only)
 */
router.post('/logo', multer_1.upload.single('logo'), settingsController.uploadLogo);
/**
 * @route   DELETE /api/admin/settings/logo
 * @desc    Delete company logo
 * @access  Private (Admin only)
 */
router.delete('/logo', settingsController.deleteLogo);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map
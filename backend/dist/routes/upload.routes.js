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
const uploadController = __importStar(require("../controllers/uploadController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const deleteImageSchema = joi_1.default.object({
    imagePath: joi_1.default.string().required()
});
/**
 * @route   GET /api/admin/uploads/stats
 * @desc    Get upload statistics
 * @access  Private (Admin only)
 */
router.get('/stats', uploadController.getUploadStats);
/**
 * @route   POST /api/admin/uploads/images
 * @desc    Upload multiple images
 * @access  Private (Admin only)
 */
router.post('/images', multer_1.upload.array('images', 20), uploadController.uploadImages);
/**
 * @route   POST /api/admin/uploads/image
 * @desc    Upload single image
 * @access  Private (Admin only)
 */
router.post('/image', multer_1.upload.single('image'), uploadController.uploadImage);
/**
 * @route   POST /api/admin/uploads/cleanup
 * @desc    Cleanup orphaned files
 * @access  Private (Admin only)
 */
router.post('/cleanup', uploadController.cleanupOrphanedFiles);
/**
 * @route   DELETE /api/admin/uploads/image
 * @desc    Delete image
 * @access  Private (Admin only)
 */
router.delete('/image', (0, validate_1.validate)(deleteImageSchema), uploadController.deleteImageFile);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map
import { Router } from 'express';
import * as uploadController from '../controllers/uploadController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const deleteImageSchema = Joi.object({
  imagePath: Joi.string().required()
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
router.post('/images', upload.array('images', 20), uploadController.uploadImages);

/**
 * @route   POST /api/admin/uploads/image
 * @desc    Upload single image
 * @access  Private (Admin only)
 */
router.post('/image', upload.single('image'), uploadController.uploadImage);

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
router.delete('/image', validate(deleteImageSchema), uploadController.deleteImageFile);

export default router;

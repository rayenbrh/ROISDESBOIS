import { Router } from 'express';
import * as subProductController from '../controllers/subProductController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { localizedStringSchema, paginationSchema } from '../middleware/validate';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const createSubProductSchema = Joi.object({
  title: localizedStringSchema.required(),
  sku: Joi.string().allow('', null),
  extraPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  metadata: Joi.object()
});

const updateSubProductSchema = Joi.object({
  title: localizedStringSchema,
  sku: Joi.string().allow('', null),
  extraPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  metadata: Joi.object()
});

const adjustStockSchema = Joi.object({
  adjustment: Joi.number().integer().required(),
  reason: Joi.string().allow('', null)
});

const getSubProductsQuerySchema = paginationSchema.keys({
  search: Joi.string(),
  lowStock: Joi.string().valid('true', 'false')
});

/**
 * @route   GET /api/admin/subproducts
 * @desc    Get all subproducts with pagination
 * @access  Private (Admin only)
 */
router.get('/', validateQuery(getSubProductsQuerySchema), subProductController.getSubProducts);

/**
 * @route   GET /api/admin/subproducts/:id
 * @desc    Get subproduct by ID
 * @access  Private (Admin only)
 */
router.get('/:id', subProductController.getSubProductById);

/**
 * @route   POST /api/admin/subproducts
 * @desc    Create new subproduct
 * @access  Private (Admin only)
 */
router.post('/', validate(createSubProductSchema), subProductController.createSubProduct);

/**
 * @route   PUT /api/admin/subproducts/:id
 * @desc    Update subproduct
 * @access  Private (Admin only)
 */
router.put('/:id', validate(updateSubProductSchema), subProductController.updateSubProduct);

/**
 * @route   PUT /api/admin/subproducts/:id/stock
 * @desc    Adjust stock
 * @access  Private (Admin only)
 */
router.put('/:id/stock', validate(adjustStockSchema), subProductController.adjustStock);

/**
 * @route   POST /api/admin/subproducts/:id/images
 * @desc    Upload images for subproduct
 * @access  Private (Admin only)
 */
router.post('/:id/images', upload.array('images', 10), subProductController.uploadSubProductImages);

/**
 * @route   DELETE /api/admin/subproducts/:id/images/:imageIndex
 * @desc    Delete image from subproduct
 * @access  Private (Admin only)
 */
router.delete('/:id/images/:imageIndex', subProductController.deleteSubProductImage);

/**
 * @route   DELETE /api/admin/subproducts/:id
 * @desc    Delete subproduct
 * @access  Private (Admin only)
 */
router.delete('/:id', subProductController.deleteSubProduct);

export default router;

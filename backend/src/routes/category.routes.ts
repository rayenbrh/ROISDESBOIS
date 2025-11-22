import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { localizedStringSchema, objectIdSchema, paginationSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const createCategorySchema = Joi.object({
  name: localizedStringSchema.required(),
  slug: Joi.string().required(),
  parentId: objectIdSchema.allow(null),
  icon: Joi.string().allow('', null),
  order: Joi.number().integer().min(0)
});

const updateCategorySchema = Joi.object({
  name: localizedStringSchema,
  slug: Joi.string(),
  parentId: objectIdSchema.allow(null),
  icon: Joi.string().allow('', null),
  order: Joi.number().integer().min(0)
});

const reorderCategoriesSchema = Joi.object({
  categoryOrders: Joi.array().items(
    Joi.object({
      id: objectIdSchema.required(),
      order: Joi.number().integer().min(0).required()
    })
  ).required()
});

const getCategoriesQuerySchema = paginationSchema.keys({
  tree: Joi.string().valid('true', 'false'),
  parentId: Joi.string().allow('null')
});

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories (tree or flat)
 * @access  Private (Admin only)
 */
router.get('/', validateQuery(getCategoriesQuerySchema), categoryController.getCategories);

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Private (Admin only)
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post('/', validate(createCategorySchema), categoryController.createCategory);

/**
 * @route   PUT /api/admin/categories/reorder
 * @desc    Reorder categories
 * @access  Private (Admin only)
 */
router.put('/reorder', validate(reorderCategoriesSchema), categoryController.reorderCategories);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete('/:id', categoryController.deleteCategory);

export default router;

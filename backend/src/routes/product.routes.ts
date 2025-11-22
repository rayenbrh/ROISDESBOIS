import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { localizedStringSchema, objectIdSchema, paginationSchema } from '../middleware/validate';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const productVariantSchema = Joi.object({
  color: localizedStringSchema.required(),
  sku: Joi.string().required(),
  image: Joi.string().allow('', null),
  stock: Joi.number().integer().min(0).required()
});

const bulkPriceSchema = Joi.object({
  minQty: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required()
});

const productPriceSchema = Joi.object({
  retail: Joi.number().min(0).required(),
  bulkPrices: Joi.array().items(bulkPriceSchema)
});

const componentGroupSchema = Joi.object({
  componentKey: Joi.string().required(),
  label: localizedStringSchema.required(),
  subProductIds: Joi.array().items(objectIdSchema).min(1).required(),
  required: Joi.boolean().required()
});

const specialConfigSchema = Joi.object({
  components: Joi.array().items(componentGroupSchema).min(1).required(),
  combinationImages: Joi.array(),
  compositeMode: Joi.string().valid('auto', 'manual', 'both').required()
});

const createProductSchema = Joi.object({
  title: localizedStringSchema.required(),
  description: localizedStringSchema.required(),
  sku: Joi.string().required(),
  variants: Joi.array().items(productVariantSchema),
  price: productPriceSchema.required(),
  cost: Joi.number().min(0),
  categories: Joi.array().items(objectIdSchema).min(1).required(),
  isSpecial: Joi.boolean(),
  specialConfig: specialConfigSchema,
  stockPolicy: Joi.string().valid('byProduct', 'byVariant', 'byComponent'),
  stock: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  meta: Joi.object({
    title: localizedStringSchema,
    description: localizedStringSchema,
    keywords: localizedStringSchema
  })
});

const updateProductSchema = Joi.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  sku: Joi.string(),
  variants: Joi.array().items(productVariantSchema),
  price: productPriceSchema,
  cost: Joi.number().min(0),
  categories: Joi.array().items(objectIdSchema).min(1),
  isSpecial: Joi.boolean(),
  specialConfig: specialConfigSchema,
  stockPolicy: Joi.string().valid('byProduct', 'byVariant', 'byComponent'),
  stock: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  meta: Joi.object({
    title: localizedStringSchema,
    description: localizedStringSchema,
    keywords: localizedStringSchema
  })
});

const adjustStockSchema = Joi.object({
  adjustment: Joi.number().integer().required(),
  reason: Joi.string().allow('', null),
  variantId: Joi.string().allow(null)
});

const generateCompositeSchema = Joi.object({
  mapping: Joi.object().pattern(
    Joi.string(),
    objectIdSchema
  ).required()
});

const getProductsQuerySchema = paginationSchema.keys({
  search: Joi.string(),
  categoryId: objectIdSchema,
  isSpecial: Joi.string().valid('true', 'false'),
  isActive: Joi.string().valid('true', 'false'),
  isFeatured: Joi.string().valid('true', 'false')
});

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with pagination
 * @access  Private (Admin only)
 */
router.get('/', validateQuery(getProductsQuerySchema), productController.getProducts);

/**
 * @route   GET /api/admin/products/composite-job/:jobId
 * @desc    Get composite generation job status
 * @access  Private (Admin only)
 */
router.get('/composite-job/:jobId', productController.getCompositeJobStatus);

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product by ID
 * @access  Private (Admin only)
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private (Admin only)
 */
router.post('/', validate(createProductSchema), productController.createProduct);

/**
 * @route   POST /api/admin/products/:id/generate-composite
 * @desc    Generate composite image for special product
 * @access  Private (Admin only)
 */
router.post('/:id/generate-composite', validate(generateCompositeSchema), productController.generateComposite);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 */
router.put('/:id', validate(updateProductSchema), productController.updateProduct);

/**
 * @route   PUT /api/admin/products/:id/stock
 * @desc    Adjust stock
 * @access  Private (Admin only)
 */
router.put('/:id/stock', validate(adjustStockSchema), productController.adjustStock);

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload images for product
 * @access  Private (Admin only)
 */
router.post('/:id/images', upload.array('images', 10), productController.uploadProductImages);

/**
 * @route   DELETE /api/admin/products/:id/images/:imageIndex
 * @desc    Delete image from product
 * @access  Private (Admin only)
 */
router.delete('/:id/images/:imageIndex', productController.deleteProductImage);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product
 * @access  Private (Admin only)
 */
router.delete('/:id', productController.deleteProduct);

export default router;

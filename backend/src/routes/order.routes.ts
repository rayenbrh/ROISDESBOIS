import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, adminOnly, adminOrCommercial } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { localizedStringSchema, objectIdSchema, paginationSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const orderLineSchema = Joi.object({
  productId: objectIdSchema.required(),
  productTitle: localizedStringSchema.required(),
  variantId: Joi.string().allow(null),
  componentSelections: Joi.object().pattern(Joi.string(), objectIdSchema),
  unitPrice: Joi.number().min(0).required(),
  qty: Joi.number().integer().min(1).required(),
  lineTotal: Joi.number().min(0).required(),
  costPerUnit: Joi.number().min(0)
});

const createOrderSchema = Joi.object({
  clientId: objectIdSchema.allow(null),
  commercialId: objectIdSchema.allow(null),
  source: Joi.string().valid('catalog', 'pos', 'admin'),
  lines: Joi.array().items(orderLineSchema).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  remise: Joi.number().min(0),
  tax: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  costTotal: Joi.number().min(0),
  netIncome: Joi.number(),
  notes: Joi.string().allow('', null),
  shippingDate: Joi.date()
});

const updateOrderSchema = Joi.object({
  clientId: objectIdSchema.allow(null),
  commercialId: objectIdSchema.allow(null),
  lines: Joi.array().items(orderLineSchema).min(1),
  subtotal: Joi.number().min(0),
  remise: Joi.number().min(0),
  tax: Joi.number().min(0),
  total: Joi.number().min(0),
  costTotal: Joi.number().min(0),
  netIncome: Joi.number(),
  notes: Joi.string().allow('', null),
  shippingDate: Joi.date()
});

const changeStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled').required(),
  note: Joi.string().allow('', null)
});

const assignCommercialSchema = Joi.object({
  commercialId: objectIdSchema.allow(null)
});

const getOrdersQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'),
  source: Joi.string().valid('catalog', 'pos', 'admin'),
  clientId: objectIdSchema,
  commercialId: objectIdSchema,
  search: Joi.string()
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination
 * @access  Private (Admin or Commercial)
 */
router.get('/', adminOrCommercial, validateQuery(getOrdersQuerySchema), orderController.getOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order by ID
 * @access  Private (Admin or Commercial)
 */
router.get('/:id', adminOrCommercial, orderController.getOrderById);

/**
 * @route   POST /api/admin/orders
 * @desc    Create new order
 * @access  Private (Admin or Commercial)
 */
router.post('/', adminOrCommercial, validate(createOrderSchema), orderController.createOrder);

/**
 * @route   POST /api/admin/orders/:id/production-sheet
 * @desc    Generate production sheet
 * @access  Private (Admin only)
 */
router.post('/:id/production-sheet', adminOnly, orderController.generateOrderProductionSheet);

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order
 * @access  Private (Admin or Commercial)
 */
router.put('/:id', adminOrCommercial, validate(updateOrderSchema), orderController.updateOrder);

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Change order status
 * @access  Private (Admin only)
 */
router.put('/:id/status', adminOnly, validate(changeStatusSchema), orderController.changeOrderStatus);

/**
 * @route   PUT /api/admin/orders/:id/assign-commercial
 * @desc    Assign commercial to order
 * @access  Private (Admin only)
 */
router.put('/:id/assign-commercial', adminOnly, validate(assignCommercialSchema), orderController.assignCommercial);

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete order
 * @access  Private (Admin only)
 */
router.delete('/:id', adminOnly, orderController.deleteOrder);

export default router;

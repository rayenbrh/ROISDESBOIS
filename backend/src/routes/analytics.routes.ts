import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate, adminOnly, adminOrCommercial } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { objectIdSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const dateRangeQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  commercialId: objectIdSchema
});

const salesOverTimeQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  interval: Joi.string().valid('daily', 'weekly', 'monthly').default('monthly')
});

const topItemsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});

const lowStockQuerySchema = Joi.object({
  threshold: Joi.number().integer().min(1).default(10)
});

/**
 * @route   GET /api/admin/analytics/dashboard
 * @desc    Get dashboard summary
 * @access  Private (Admin or Commercial)
 */
router.get('/dashboard', adminOrCommercial, analyticsController.getDashboardSummary);

/**
 * @route   GET /api/admin/analytics/sales
 * @desc    Get sales statistics
 * @access  Private (Admin or Commercial)
 */
router.get('/sales', adminOrCommercial, validateQuery(dateRangeQuerySchema), analyticsController.getSalesStats);

/**
 * @route   GET /api/admin/analytics/sales-over-time
 * @desc    Get sales over time
 * @access  Private (Admin or Commercial)
 */
router.get('/sales-over-time', adminOrCommercial, validateQuery(salesOverTimeQuerySchema), analyticsController.getSalesOverTime);

/**
 * @route   GET /api/admin/analytics/top-products
 * @desc    Get top products by sales
 * @access  Private (Admin or Commercial)
 */
router.get('/top-products', adminOrCommercial, validateQuery(topItemsQuerySchema), analyticsController.getTopProducts);

/**
 * @route   GET /api/admin/analytics/top-clients
 * @desc    Get top clients by revenue
 * @access  Private (Admin only)
 */
router.get('/top-clients', adminOnly, validateQuery(topItemsQuerySchema), analyticsController.getTopClients);

/**
 * @route   GET /api/admin/analytics/commercial-performance
 * @desc    Get commercial performance
 * @access  Private (Admin only)
 */
router.get('/commercial-performance', adminOnly, validateQuery(dateRangeQuerySchema), analyticsController.getCommercialPerformance);

/**
 * @route   GET /api/admin/analytics/low-stock
 * @desc    Get low stock products
 * @access  Private (Admin or Commercial)
 */
router.get('/low-stock', adminOrCommercial, validateQuery(lowStockQuerySchema), analyticsController.getLowStock);

/**
 * @route   GET /api/admin/analytics/inventory
 * @desc    Get inventory statistics
 * @access  Private (Admin only)
 */
router.get('/inventory', adminOnly, analyticsController.getInventoryStats);

/**
 * @route   GET /api/admin/analytics/payments
 * @desc    Get payment statistics
 * @access  Private (Admin only)
 */
router.get('/payments', adminOnly, validateQuery(dateRangeQuerySchema), analyticsController.getPaymentStats);

export default router;

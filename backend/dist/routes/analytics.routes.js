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
const analyticsController = __importStar(require("../controllers/analyticsController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Validation schemas
const dateRangeQuerySchema = joi_1.default.object({
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso(),
    commercialId: validate_2.objectIdSchema
});
const salesOverTimeQuerySchema = joi_1.default.object({
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso(),
    interval: joi_1.default.string().valid('daily', 'weekly', 'monthly').default('monthly')
});
const topItemsQuerySchema = joi_1.default.object({
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso()
});
const lowStockQuerySchema = joi_1.default.object({
    threshold: joi_1.default.number().integer().min(1).default(10)
});
/**
 * @route   GET /api/admin/analytics/dashboard
 * @desc    Get dashboard summary
 * @access  Private (Admin or Commercial)
 */
router.get('/dashboard', auth_1.adminOrCommercial, analyticsController.getDashboardSummary);
/**
 * @route   GET /api/admin/analytics/sales
 * @desc    Get sales statistics
 * @access  Private (Admin or Commercial)
 */
router.get('/sales', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(dateRangeQuerySchema), analyticsController.getSalesStats);
/**
 * @route   GET /api/admin/analytics/sales-over-time
 * @desc    Get sales over time
 * @access  Private (Admin or Commercial)
 */
router.get('/sales-over-time', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(salesOverTimeQuerySchema), analyticsController.getSalesOverTime);
/**
 * @route   GET /api/admin/analytics/top-products
 * @desc    Get top products by sales
 * @access  Private (Admin or Commercial)
 */
router.get('/top-products', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(topItemsQuerySchema), analyticsController.getTopProducts);
/**
 * @route   GET /api/admin/analytics/top-clients
 * @desc    Get top clients by revenue
 * @access  Private (Admin only)
 */
router.get('/top-clients', auth_1.adminOnly, (0, validate_1.validateQuery)(topItemsQuerySchema), analyticsController.getTopClients);
/**
 * @route   GET /api/admin/analytics/commercial-performance
 * @desc    Get commercial performance
 * @access  Private (Admin only)
 */
router.get('/commercial-performance', auth_1.adminOnly, (0, validate_1.validateQuery)(dateRangeQuerySchema), analyticsController.getCommercialPerformance);
/**
 * @route   GET /api/admin/analytics/low-stock
 * @desc    Get low stock products
 * @access  Private (Admin or Commercial)
 */
router.get('/low-stock', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(lowStockQuerySchema), analyticsController.getLowStock);
/**
 * @route   GET /api/admin/analytics/inventory
 * @desc    Get inventory statistics
 * @access  Private (Admin only)
 */
router.get('/inventory', auth_1.adminOnly, analyticsController.getInventoryStats);
/**
 * @route   GET /api/admin/analytics/payments
 * @desc    Get payment statistics
 * @access  Private (Admin only)
 */
router.get('/payments', auth_1.adminOnly, (0, validate_1.validateQuery)(dateRangeQuerySchema), analyticsController.getPaymentStats);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map
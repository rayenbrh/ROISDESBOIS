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
const orderController = __importStar(require("../controllers/orderController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Validation schemas
const orderLineSchema = joi_1.default.object({
    productId: validate_2.objectIdSchema.required(),
    productTitle: validate_2.localizedStringSchema.required(),
    variantId: joi_1.default.string().allow(null),
    componentSelections: joi_1.default.object().pattern(joi_1.default.string(), validate_2.objectIdSchema),
    unitPrice: joi_1.default.number().min(0).required(),
    qty: joi_1.default.number().integer().min(1).required(),
    lineTotal: joi_1.default.number().min(0).required(),
    costPerUnit: joi_1.default.number().min(0)
});
const createOrderSchema = joi_1.default.object({
    clientId: validate_2.objectIdSchema.allow(null),
    commercialId: validate_2.objectIdSchema.allow(null),
    source: joi_1.default.string().valid('catalog', 'pos', 'admin'),
    lines: joi_1.default.array().items(orderLineSchema).min(1).required(),
    subtotal: joi_1.default.number().min(0).required(),
    remise: joi_1.default.number().min(0),
    tax: joi_1.default.number().min(0).required(),
    total: joi_1.default.number().min(0).required(),
    costTotal: joi_1.default.number().min(0),
    netIncome: joi_1.default.number(),
    notes: joi_1.default.string().allow('', null),
    shippingDate: joi_1.default.date()
});
const updateOrderSchema = joi_1.default.object({
    clientId: validate_2.objectIdSchema.allow(null),
    commercialId: validate_2.objectIdSchema.allow(null),
    lines: joi_1.default.array().items(orderLineSchema).min(1),
    subtotal: joi_1.default.number().min(0),
    remise: joi_1.default.number().min(0),
    tax: joi_1.default.number().min(0),
    total: joi_1.default.number().min(0),
    costTotal: joi_1.default.number().min(0),
    netIncome: joi_1.default.number(),
    notes: joi_1.default.string().allow('', null),
    shippingDate: joi_1.default.date()
});
const changeStatusSchema = joi_1.default.object({
    status: joi_1.default.string().valid('new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled').required(),
    note: joi_1.default.string().allow('', null)
});
const assignCommercialSchema = joi_1.default.object({
    commercialId: validate_2.objectIdSchema.allow(null)
});
const getOrdersQuerySchema = validate_2.paginationSchema.keys({
    status: joi_1.default.string().valid('new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'),
    source: joi_1.default.string().valid('catalog', 'pos', 'admin'),
    clientId: validate_2.objectIdSchema,
    commercialId: validate_2.objectIdSchema,
    search: joi_1.default.string()
});
/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination
 * @access  Private (Admin or Commercial)
 */
router.get('/', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(getOrdersQuerySchema), orderController.getOrders);
/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order by ID
 * @access  Private (Admin or Commercial)
 */
router.get('/:id', auth_1.adminOrCommercial, orderController.getOrderById);
/**
 * @route   POST /api/admin/orders
 * @desc    Create new order
 * @access  Private (Admin or Commercial)
 */
router.post('/', auth_1.adminOrCommercial, (0, validate_1.validate)(createOrderSchema), orderController.createOrder);
/**
 * @route   POST /api/admin/orders/:id/production-sheet
 * @desc    Generate production sheet
 * @access  Private (Admin only)
 */
router.post('/:id/production-sheet', auth_1.adminOnly, orderController.generateOrderProductionSheet);
/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order
 * @access  Private (Admin or Commercial)
 */
router.put('/:id', auth_1.adminOrCommercial, (0, validate_1.validate)(updateOrderSchema), orderController.updateOrder);
/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Change order status
 * @access  Private (Admin only)
 */
router.put('/:id/status', auth_1.adminOnly, (0, validate_1.validate)(changeStatusSchema), orderController.changeOrderStatus);
/**
 * @route   PUT /api/admin/orders/:id/assign-commercial
 * @desc    Assign commercial to order
 * @access  Private (Admin only)
 */
router.put('/:id/assign-commercial', auth_1.adminOnly, (0, validate_1.validate)(assignCommercialSchema), orderController.assignCommercial);
/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete order
 * @access  Private (Admin only)
 */
router.delete('/:id', auth_1.adminOnly, orderController.deleteOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map
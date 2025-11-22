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
exports.getOrderStats = exports.deleteOrder = exports.generateOrderProductionSheet = exports.assignCommercial = exports.changeOrderStatus = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const pdfService_1 = require("../services/pdfService");
const logger_1 = __importDefault(require("../config/logger"));
const types_1 = require("../types");
const mongoose_1 = require("mongoose");
/**
 * Get all orders with pagination and filtering
 * GET /api/admin/orders
 */
const getOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const status = req.query.status;
        const source = req.query.source;
        const clientId = req.query.clientId;
        const commercialId = req.query.commercialId;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (clientId)
            filter.clientId = clientId;
        if (commercialId)
            filter.commercialId = commercialId;
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }
        const [orders, total] = await Promise.all([
            models_1.Order.find(filter)
                .populate('clientId', 'name email')
                .populate('commercialId', 'name email')
                .populate('invoiceId', 'invoiceNumber isPaid')
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.Order.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, orders, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
/**
 * Get order by ID
 * GET /api/admin/orders/:id
 */
const getOrderById = async (req, res, next) => {
    try {
        const order = await models_1.Order.findById(req.params.id)
            .populate('clientId', 'name email')
            .populate('commercialId', 'name email')
            .populate('invoiceId')
            .populate('lines.productId');
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
/**
 * Create new order
 * POST /api/admin/orders
 */
const createOrder = async (req, res, next) => {
    try {
        const { clientId, commercialId, source, lines, subtotal, remise, tax, total, costTotal, netIncome, notes, shippingDate } = req.body;
        // Validate order lines
        if (!lines || lines.length === 0) {
            (0, apiResponse_1.sendError)(res, 'Order must have at least one line item', 400, 'NO_LINES');
            return;
        }
        // Generate order number
        const orderNumber = await generateOrderNumber();
        const order = new models_1.Order({
            orderNumber,
            clientId,
            commercialId,
            source: source || types_1.OrderSource.ADMIN,
            lines,
            subtotal,
            remise: remise || 0,
            tax,
            total,
            costTotal,
            netIncome,
            status: types_1.OrderStatus.NEW,
            notes,
            shippingDate,
            statusHistory: [
                {
                    status: types_1.OrderStatus.NEW,
                    changedBy: req.user?.userId,
                    changedAt: new Date(),
                    note: 'Order created'
                }
            ]
        });
        await order.save();
        // Log creation
        if (req.user) {
            await (0, auditService_1.logCreate)(req.user.userId, 'order', order._id.toString(), {
                orderNumber: order.orderNumber,
                total: order.total,
                source: order.source
            });
        }
        logger_1.default.info(`Order created: ${order.orderNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, order, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
/**
 * Update order
 * PUT /api/admin/orders/:id
 */
const updateOrder = async (req, res, next) => {
    try {
        const { clientId, commercialId, lines, subtotal, remise, tax, total, costTotal, netIncome, notes, shippingDate } = req.body;
        const order = await models_1.Order.findById(req.params.id);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        // Check if order can be edited (only NEW and PROCESSING orders)
        if (![types_1.OrderStatus.NEW, types_1.OrderStatus.PROCESSING].includes(order.status)) {
            (0, apiResponse_1.sendError)(res, 'Order cannot be edited in current status', 400, 'ORDER_NOT_EDITABLE');
            return;
        }
        // Update fields
        if (clientId !== undefined)
            order.clientId = clientId;
        if (commercialId !== undefined)
            order.commercialId = commercialId;
        if (lines)
            order.lines = lines;
        if (subtotal !== undefined)
            order.subtotal = subtotal;
        if (remise !== undefined)
            order.remise = remise;
        if (tax !== undefined)
            order.tax = tax;
        if (total !== undefined)
            order.total = total;
        if (costTotal !== undefined)
            order.costTotal = costTotal;
        if (netIncome !== undefined)
            order.netIncome = netIncome;
        if (notes !== undefined)
            order.notes = notes;
        if (shippingDate !== undefined)
            order.shippingDate = shippingDate;
        await order.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'order', order._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`Order updated: ${order.orderNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrder = updateOrder;
/**
 * Change order status
 * PUT /api/admin/orders/:id/status
 */
const changeOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const order = await models_1.Order.findById(req.params.id);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        // Validate status transition
        if (!isValidStatusTransition(order.status, status)) {
            (0, apiResponse_1.sendError)(res, `Cannot change status from ${order.status} to ${status}`, 400, 'INVALID_STATUS_TRANSITION');
            return;
        }
        const oldStatus = order.status;
        order.status = status;
        // Add to status history
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status,
            changedBy: new mongoose_1.Types.ObjectId(req.user?.userId),
            changedAt: new Date(),
            note
        });
        await order.save();
        // Log status change
        if (req.user) {
            await (0, auditService_1.logStatusChange)(req.user.userId, 'order', order._id.toString(), oldStatus, status, { note });
        }
        logger_1.default.info(`Order status changed: ${order.orderNumber} from ${oldStatus} to ${status} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
};
exports.changeOrderStatus = changeOrderStatus;
/**
 * Assign commercial to order
 * PUT /api/admin/orders/:id/assign-commercial
 */
const assignCommercial = async (req, res, next) => {
    try {
        const { commercialId } = req.body;
        const order = await models_1.Order.findById(req.params.id);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        // Verify commercial exists if provided
        if (commercialId) {
            const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
            const commercial = await User.findById(commercialId);
            if (!commercial || commercial.role !== 'commercial') {
                (0, apiResponse_1.sendError)(res, 'Invalid commercial user', 400, 'INVALID_COMMERCIAL');
                return;
            }
        }
        order.commercialId = commercialId;
        await order.save();
        // Log assignment
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'order', order._id.toString(), {
                action: 'commercial_assigned',
                commercialId
            });
        }
        logger_1.default.info(`Commercial assigned to order: ${order.orderNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
};
exports.assignCommercial = assignCommercial;
/**
 * Generate production sheet for order
 * POST /api/admin/orders/:id/production-sheet
 */
const generateOrderProductionSheet = async (req, res, next) => {
    try {
        const order = await models_1.Order.findById(req.params.id);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        const pdfPath = await (0, pdfService_1.generateProductionSheet)(order._id.toString());
        // Log action
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'order', order._id.toString(), {
                action: 'production_sheet_generated'
            });
        }
        logger_1.default.info(`Production sheet generated for order: ${order.orderNumber}`);
        (0, apiResponse_1.sendSuccess)(res, {
            message: 'Production sheet generated successfully',
            pdfPath
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateOrderProductionSheet = generateOrderProductionSheet;
/**
 * Delete order
 * DELETE /api/admin/orders/:id
 */
const deleteOrder = async (req, res, next) => {
    try {
        const order = await models_1.Order.findById(req.params.id);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        // Only allow deletion of NEW orders
        if (order.status !== types_1.OrderStatus.NEW) {
            (0, apiResponse_1.sendError)(res, 'Only NEW orders can be deleted. Use Cancel for other statuses.', 400, 'ORDER_NOT_DELETABLE');
            return;
        }
        // Check if order has an invoice
        if (order.invoiceId) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete order with associated invoice', 400, 'HAS_INVOICE');
            return;
        }
        await order.deleteOne();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'order', order._id.toString(), {
                action: 'deleted',
                orderNumber: order.orderNumber
            });
        }
        logger_1.default.info(`Order deleted: ${order.orderNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Order deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrder = deleteOrder;
/**
 * Get order statistics
 * GET /api/admin/orders/stats
 */
const getOrderStats = async (_req, res, next) => {
    try {
        const stats = await models_1.Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]);
        const formattedStats = stats.reduce((acc, stat) => {
            acc[stat._id] = {
                count: stat.count,
                totalAmount: stat.totalAmount
            };
            return acc;
        }, {});
        (0, apiResponse_1.sendSuccess)(res, formattedStats);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderStats = getOrderStats;
/**
 * Helper function to generate unique order number
 */
async function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    // Count orders created today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const todayOrdersCount = await models_1.Order.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
}
/**
 * Helper function to validate status transitions
 */
function isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
        [types_1.OrderStatus.NEW]: [types_1.OrderStatus.PROCESSING, types_1.OrderStatus.CANCELLED],
        [types_1.OrderStatus.PROCESSING]: [types_1.OrderStatus.READY, types_1.OrderStatus.CANCELLED],
        [types_1.OrderStatus.READY]: [types_1.OrderStatus.SHIPPED, types_1.OrderStatus.PROCESSING],
        [types_1.OrderStatus.SHIPPED]: [types_1.OrderStatus.DELIVERED],
        [types_1.OrderStatus.DELIVERED]: [],
        [types_1.OrderStatus.CANCELLED]: []
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
}
//# sourceMappingURL=orderController.js.map
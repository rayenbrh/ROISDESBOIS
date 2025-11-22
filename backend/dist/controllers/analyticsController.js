"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = exports.getPaymentStats = exports.getInventoryStats = exports.getLowStock = exports.getCommercialPerformance = exports.getTopClients = exports.getTopProducts = exports.getSalesOverTime = exports.getSalesStats = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const types_1 = require("../types");
/**
 * Get sales statistics
 * GET /api/admin/analytics/sales
 */
const getSalesStats = async (req, res, next) => {
    try {
        const { startDate, endDate, commercialId } = req.query;
        const filter = {
            status: { $ne: types_1.OrderStatus.CANCELLED }
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        if (commercialId) {
            filter.commercialId = commercialId;
        }
        const stats = await models_1.Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    totalCost: { $sum: '$costTotal' },
                    totalProfit: { $sum: '$netIncome' },
                    avgOrderValue: { $avg: '$total' }
                }
            }
        ]);
        const result = stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            avgOrderValue: 0
        };
        // Get status breakdown
        const statusBreakdown = await models_1.Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]);
        (0, apiResponse_1.sendSuccess)(res, {
            ...result,
            statusBreakdown
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesStats = getSalesStats;
/**
 * Get sales over time (daily/weekly/monthly)
 * GET /api/admin/analytics/sales-over-time
 */
const getSalesOverTime = async (req, res, next) => {
    try {
        const { startDate, endDate, interval } = req.query;
        const filter = {
            status: { $ne: types_1.OrderStatus.CANCELLED }
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Determine grouping based on interval
        let dateGrouping;
        switch (interval) {
            case 'daily':
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case 'weekly':
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                break;
            case 'monthly':
            default:
                dateGrouping = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                break;
        }
        const salesData = await models_1.Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: dateGrouping,
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' },
                    profit: { $sum: '$netIncome' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        (0, apiResponse_1.sendSuccess)(res, salesData);
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOverTime = getSalesOverTime;
/**
 * Get top products by sales
 * GET /api/admin/analytics/top-products
 */
const getTopProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const { startDate, endDate } = req.query;
        const filter = {
            status: { $ne: types_1.OrderStatus.CANCELLED }
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const topProducts = await models_1.Order.aggregate([
            { $match: filter },
            { $unwind: '$lines' },
            {
                $group: {
                    _id: '$lines.productId',
                    productTitle: { $first: '$lines.productTitle' },
                    totalQuantity: { $sum: '$lines.qty' },
                    totalRevenue: { $sum: '$lines.lineTotal' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
        ]);
        (0, apiResponse_1.sendSuccess)(res, topProducts);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopProducts = getTopProducts;
/**
 * Get top clients by revenue
 * GET /api/admin/analytics/top-clients
 */
const getTopClients = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const { startDate, endDate } = req.query;
        const filter = {
            status: { $ne: types_1.OrderStatus.CANCELLED },
            clientId: { $exists: true, $ne: null }
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const topClients = await models_1.Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$clientId',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } }
        ]);
        (0, apiResponse_1.sendSuccess)(res, topClients);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopClients = getTopClients;
/**
 * Get commercial performance
 * GET /api/admin/analytics/commercial-performance
 */
const getCommercialPerformance = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {
            status: { $ne: types_1.OrderStatus.CANCELLED },
            commercialId: { $exists: true, $ne: null }
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const performance = await models_1.Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$commercialId',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    totalProfit: { $sum: '$netIncome' },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'commercial'
                }
            },
            { $unwind: { path: '$commercial', preserveNullAndEmptyArrays: true } }
        ]);
        (0, apiResponse_1.sendSuccess)(res, performance);
    }
    catch (error) {
        next(error);
    }
};
exports.getCommercialPerformance = getCommercialPerformance;
/**
 * Get low stock products
 * GET /api/admin/analytics/low-stock
 */
const getLowStock = async (req, res, next) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        // Get low stock products
        const lowStockProducts = await models_1.Product.find({
            isActive: true,
            stockPolicy: 'byProduct',
            stock: { $lte: threshold }
        })
            .select('title sku stock images')
            .sort({ stock: 1 })
            .limit(50);
        // Get low stock subproducts
        const lowStockSubProducts = await models_1.SubProduct.find({
            stock: { $lte: threshold }
        })
            .select('title sku stock images')
            .sort({ stock: 1 })
            .limit(50);
        // Get products with low stock variants
        const productsWithLowStockVariants = await models_1.Product.find({
            isActive: true,
            stockPolicy: 'byVariant',
            'variants.stock': { $lte: threshold }
        })
            .select('title sku variants')
            .limit(50);
        const lowStockVariants = productsWithLowStockVariants.flatMap(product => {
            const lowVariants = product.variants?.filter(v => v.stock <= threshold) || [];
            return lowVariants.map(variant => ({
                productId: product._id,
                productTitle: product.title,
                variantSku: variant.sku,
                variantColor: variant.color,
                stock: variant.stock
            }));
        });
        (0, apiResponse_1.sendSuccess)(res, {
            products: lowStockProducts,
            subProducts: lowStockSubProducts,
            variants: lowStockVariants
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLowStock = getLowStock;
/**
 * Get inventory statistics
 * GET /api/admin/analytics/inventory
 */
const getInventoryStats = async (_req, res, next) => {
    try {
        const productStats = await models_1.Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    },
                    specialProducts: {
                        $sum: { $cond: [{ $eq: ['$isSpecial', true] }, 1, 0] }
                    },
                    totalInventoryValue: {
                        $sum: {
                            $multiply: [
                                { $ifNull: ['$stock', 0] },
                                { $ifNull: ['$cost', 0] }
                            ]
                        }
                    }
                }
            }
        ]);
        const subProductStats = await models_1.SubProduct.aggregate([
            {
                $group: {
                    _id: null,
                    totalSubProducts: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    totalInventoryValue: {
                        $sum: {
                            $multiply: ['$stock', { $ifNull: ['$extraPrice', 0] }]
                        }
                    }
                }
            }
        ]);
        (0, apiResponse_1.sendSuccess)(res, {
            products: productStats[0] || {},
            subProducts: subProductStats[0] || {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryStats = getInventoryStats;
/**
 * Get payment statistics
 * GET /api/admin/analytics/payments
 */
const getPaymentStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const invoiceStats = await models_1.Invoice.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    paidInvoices: {
                        $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] }
                    },
                    unpaidInvoices: {
                        $sum: { $cond: [{ $eq: ['$isPaid', false] }, 1, 0] }
                    },
                    totalAmountDue: { $sum: '$amountDue' },
                    totalAmountPaid: { $sum: '$amountPaid' },
                    totalOutstanding: {
                        $sum: { $subtract: ['$amountDue', '$amountPaid'] }
                    }
                }
            }
        ]);
        // Get payment method breakdown
        const paymentMethodBreakdown = await models_1.Invoice.aggregate([
            { $match: filter },
            { $unwind: '$payments' },
            {
                $group: {
                    _id: '$payments.method',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$payments.amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
        // Get overdue invoices
        const overdueInvoices = await models_1.Invoice.countDocuments({
            ...filter,
            isPaid: false,
            dueDate: { $lt: new Date() }
        });
        (0, apiResponse_1.sendSuccess)(res, {
            ...(invoiceStats[0] || {}),
            paymentMethodBreakdown,
            overdueInvoices
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentStats = getPaymentStats;
/**
 * Get dashboard summary
 * GET /api/admin/analytics/dashboard
 */
const getDashboardSummary = async (_req, res, next) => {
    try {
        // Get counts
        const [totalOrders, totalProducts, totalClients, totalInvoices, unpaidInvoices] = await Promise.all([
            models_1.Order.countDocuments({ status: { $ne: types_1.OrderStatus.CANCELLED } }),
            models_1.Product.countDocuments({ isActive: true }),
            models_1.User.countDocuments({ role: 'client', isActive: true }),
            models_1.Invoice.countDocuments(),
            models_1.Invoice.countDocuments({ isPaid: false })
        ]);
        // Get recent orders
        const recentOrders = await models_1.Order.find()
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        // Get today's sales
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todaySales = await models_1.Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay },
                    status: { $ne: types_1.OrderStatus.CANCELLED }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            }
        ]);
        // Get this month's sales
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthSales = await models_1.Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $ne: types_1.OrderStatus.CANCELLED }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' },
                    profit: { $sum: '$netIncome' }
                }
            }
        ]);
        (0, apiResponse_1.sendSuccess)(res, {
            counts: {
                totalOrders,
                totalProducts,
                totalClients,
                totalInvoices,
                unpaidInvoices
            },
            recentOrders,
            todaySales: todaySales[0] || { count: 0, revenue: 0 },
            monthSales: monthSales[0] || { count: 0, revenue: 0, profit: 0 }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardSummary = getDashboardSummary;
//# sourceMappingURL=analyticsController.js.map
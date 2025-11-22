import { Request, Response, NextFunction } from 'express';
import { Order, Product, SubProduct, Invoice, User } from '../models';
import { sendSuccess, sendError } from '../utils/apiResponse';
import logger from '../config/logger';
import { OrderStatus } from '../types';

/**
 * Get sales statistics
 * GET /api/admin/analytics/sales
 */
export const getSalesStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, commercialId } = req.query;

    const filter: any = {
      status: { $ne: OrderStatus.CANCELLED }
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (commercialId) {
      filter.commercialId = commercialId;
    }

    const stats = await Order.aggregate([
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
    const statusBreakdown = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    sendSuccess(res, {
      ...result,
      statusBreakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales over time (daily/weekly/monthly)
 * GET /api/admin/analytics/sales-over-time
 */
export const getSalesOverTime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, interval } = req.query;

    const filter: any = {
      status: { $ne: OrderStatus.CANCELLED }
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Determine grouping based on interval
    let dateGrouping: any;
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

    const salesData = await Order.aggregate([
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

    sendSuccess(res, salesData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get top products by sales
 * GET /api/admin/analytics/top-products
 */
export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const { startDate, endDate } = req.query;

    const filter: any = {
      status: { $ne: OrderStatus.CANCELLED }
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const topProducts = await Order.aggregate([
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

    sendSuccess(res, topProducts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get top clients by revenue
 * GET /api/admin/analytics/top-clients
 */
export const getTopClients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const { startDate, endDate } = req.query;

    const filter: any = {
      status: { $ne: OrderStatus.CANCELLED },
      clientId: { $exists: true, $ne: null }
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const topClients = await Order.aggregate([
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

    sendSuccess(res, topClients);
  } catch (error) {
    next(error);
  }
};

/**
 * Get commercial performance
 * GET /api/admin/analytics/commercial-performance
 */
export const getCommercialPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {
      status: { $ne: OrderStatus.CANCELLED },
      commercialId: { $exists: true, $ne: null }
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const performance = await Order.aggregate([
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

    sendSuccess(res, performance);
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock products
 * GET /api/admin/analytics/low-stock
 */
export const getLowStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    // Get low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      stockPolicy: 'byProduct',
      stock: { $lte: threshold }
    })
      .select('title sku stock images')
      .sort({ stock: 1 })
      .limit(50);

    // Get low stock subproducts
    const lowStockSubProducts = await SubProduct.find({
      stock: { $lte: threshold }
    })
      .select('title sku stock images')
      .sort({ stock: 1 })
      .limit(50);

    // Get products with low stock variants
    const productsWithLowStockVariants = await Product.find({
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

    sendSuccess(res, {
      products: lowStockProducts,
      subProducts: lowStockSubProducts,
      variants: lowStockVariants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory statistics
 * GET /api/admin/analytics/inventory
 */
export const getInventoryStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productStats = await Product.aggregate([
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

    const subProductStats = await SubProduct.aggregate([
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

    sendSuccess(res, {
      products: productStats[0] || {},
      subProducts: subProductStats[0] || {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment statistics
 * GET /api/admin/analytics/payments
 */
export const getPaymentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const invoiceStats = await Invoice.aggregate([
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
    const paymentMethodBreakdown = await Invoice.aggregate([
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
    const overdueInvoices = await Invoice.countDocuments({
      ...filter,
      isPaid: false,
      dueDate: { $lt: new Date() }
    });

    sendSuccess(res, {
      ...(invoiceStats[0] || {}),
      paymentMethodBreakdown,
      overdueInvoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard summary
 * GET /api/admin/analytics/dashboard
 */
export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get counts
    const [
      totalOrders,
      totalProducts,
      totalClients,
      totalInvoices,
      unpaidInvoices
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: OrderStatus.CANCELLED } }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ isPaid: false })
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
          status: { $ne: OrderStatus.CANCELLED }
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

    const monthSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $ne: OrderStatus.CANCELLED }
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

    sendSuccess(res, {
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
  } catch (error) {
    next(error);
  }
};

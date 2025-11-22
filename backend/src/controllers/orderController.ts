import { Request, Response, NextFunction } from 'express';
import { Order } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logStatusChange } from '../services/auditService';
import { generateProductionSheet as generateProductionSheetPDF } from '../services/pdfService';
import logger from '../config/logger';
import { OrderStatus, OrderSource } from '../types';
import { Types } from 'mongoose';

/**
 * Get all orders with pagination and filtering
 * GET /api/admin/orders
 */
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;
    const status = req.query.status as OrderStatus | undefined;
    const source = req.query.source as OrderSource | undefined;
    const clientId = req.query.clientId as string | undefined;
    const commercialId = req.query.commercialId as string | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (clientId) filter.clientId = clientId;
    if (commercialId) filter.commercialId = commercialId;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('clientId', 'name email')
        .populate('commercialId', 'name email')
        .populate('invoiceId', 'invoiceNumber isPaid')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    sendPaginated(res, orders, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 * GET /api/admin/orders/:id
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('commercialId', 'name email')
      .populate('invoiceId')
      .populate('lines.productId');

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new order
 * POST /api/admin/orders
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      clientId,
      commercialId,
      source,
      lines,
      subtotal,
      remise,
      tax,
      total,
      costTotal,
      netIncome,
      notes,
      shippingDate
    } = req.body;

    // Validate order lines
    if (!lines || lines.length === 0) {
      sendError(res, 'Order must have at least one line item', 400, 'NO_LINES');
      return;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    const order = new Order({
      orderNumber,
      clientId,
      commercialId,
      source: source || OrderSource.ADMIN,
      lines,
      subtotal,
      remise: remise || 0,
      tax,
      total,
      costTotal,
      netIncome,
      status: OrderStatus.NEW,
      notes,
      shippingDate,
      statusHistory: [
        {
          status: OrderStatus.NEW,
          changedBy: req.user?.userId,
          changedAt: new Date(),
          note: 'Order created'
        }
      ]
    });

    await order.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'order', order._id.toString(), {
        orderNumber: order.orderNumber,
        total: order.total,
        source: order.source
      });
    }

    logger.info(`Order created: ${order.orderNumber} by ${req.user?.email}`);

    sendSuccess(res, order, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order
 * PUT /api/admin/orders/:id
 */
export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      clientId,
      commercialId,
      lines,
      subtotal,
      remise,
      tax,
      total,
      costTotal,
      netIncome,
      notes,
      shippingDate
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Check if order can be edited (only NEW and PROCESSING orders)
    if (![OrderStatus.NEW, OrderStatus.PROCESSING].includes(order.status)) {
      sendError(
        res,
        'Order cannot be edited in current status',
        400,
        'ORDER_NOT_EDITABLE'
      );
      return;
    }

    // Update fields
    if (clientId !== undefined) order.clientId = clientId;
    if (commercialId !== undefined) order.commercialId = commercialId;
    if (lines) order.lines = lines;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (remise !== undefined) order.remise = remise;
    if (tax !== undefined) order.tax = tax;
    if (total !== undefined) order.total = total;
    if (costTotal !== undefined) order.costTotal = costTotal;
    if (netIncome !== undefined) order.netIncome = netIncome;
    if (notes !== undefined) order.notes = notes;
    if (shippingDate !== undefined) order.shippingDate = shippingDate;

    await order.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'order', order._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`Order updated: ${order.orderNumber} by ${req.user?.email}`);

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Change order status
 * PUT /api/admin/orders/:id/status
 */
export const changeOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Validate status transition
    if (!isValidStatusTransition(order.status, status)) {
      sendError(
        res,
        `Cannot change status from ${order.status} to ${status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
      return;
    }

    const oldStatus = order.status;
    order.status = status;

    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedBy: new Types.ObjectId(req.user?.userId),
      changedAt: new Date(),
      note
    });

    await order.save();

    // Log status change
    if (req.user) {
      await logStatusChange(
        req.user.userId,
        'order',
        order._id.toString(),
        oldStatus,
        status,
        { note }
      );
    }

    logger.info(
      `Order status changed: ${order.orderNumber} from ${oldStatus} to ${status} by ${req.user?.email}`
    );

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign commercial to order
 * PUT /api/admin/orders/:id/assign-commercial
 */
export const assignCommercial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commercialId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Verify commercial exists if provided
    if (commercialId) {
      const { User } = await import('../models');
      const commercial = await User.findById(commercialId);
      if (!commercial || commercial.role !== 'commercial') {
        sendError(res, 'Invalid commercial user', 400, 'INVALID_COMMERCIAL');
        return;
      }
    }

    order.commercialId = commercialId;
    await order.save();

    // Log assignment
    if (req.user) {
      await logUpdate(req.user.userId, 'order', order._id.toString(), {
        action: 'commercial_assigned',
        commercialId
      });
    }

    logger.info(`Commercial assigned to order: ${order.orderNumber} by ${req.user?.email}`);

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate production sheet for order
 * POST /api/admin/orders/:id/production-sheet
 */
export const generateOrderProductionSheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    const pdfPath = await generateProductionSheetPDF(order._id.toString());

    // Log action
    if (req.user) {
      await logUpdate(req.user.userId, 'order', order._id.toString(), {
        action: 'production_sheet_generated'
      });
    }

    logger.info(`Production sheet generated for order: ${order.orderNumber}`);

    sendSuccess(res, {
      message: 'Production sheet generated successfully',
      pdfPath
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order
 * DELETE /api/admin/orders/:id
 */
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Only allow deletion of NEW orders
    if (order.status !== OrderStatus.NEW) {
      sendError(
        res,
        'Only NEW orders can be deleted. Use Cancel for other statuses.',
        400,
        'ORDER_NOT_DELETABLE'
      );
      return;
    }

    // Check if order has an invoice
    if (order.invoiceId) {
      sendError(
        res,
        'Cannot delete order with associated invoice',
        400,
        'HAS_INVOICE'
      );
      return;
    }

    await order.deleteOne();

    // Log deletion
    if (req.user) {
      await logUpdate(req.user.userId, 'order', order._id.toString(), {
        action: 'deleted',
        orderNumber: order.orderNumber
      });
    }

    logger.info(`Order deleted: ${order.orderNumber} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics
 * GET /api/admin/orders/stats
 */
export const getOrderStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Order.aggregate([
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
    }, {} as Record<string, any>);

    sendSuccess(res, formattedStats);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to generate unique order number
 */
async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Count orders created today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const todayOrdersCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');

  return `ORD-${year}${month}${day}-${sequence}`;
}

/**
 * Helper function to validate status transitions
 */
function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.NEW]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.SHIPPED, OrderStatus.PROCESSING],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

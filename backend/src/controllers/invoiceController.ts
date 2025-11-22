import { Request, Response, NextFunction } from 'express';
import { Invoice, Order } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logPayment } from '../services/auditService';
import { generateInvoicePDF } from '../services/pdfService';
import logger from '../config/logger';

/**
 * Get all invoices with pagination and filtering
 * GET /api/admin/invoices
 */
export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;
    const isPaid = req.query.isPaid as string | undefined;
    const clientId = req.query.clientId as string | undefined;
    const commercialId = req.query.commercialId as string | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (clientId) filter.clientId = clientId;
    if (commercialId) filter.commercialId = commercialId;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('orderId', 'orderNumber total')
        .populate('clientId', 'name email')
        .populate('commercialId', 'name email')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
    ]);

    sendPaginated(res, invoices, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice by ID
 * GET /api/admin/invoices/:id
 */
export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('orderId')
      .populate('clientId', 'name email')
      .populate('commercialId', 'name email')
      .populate('payments.recordedBy', 'name');

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Create invoice from order
 * POST /api/admin/invoices
 */
export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, dueDate } = req.body;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
      return;
    }

    // Check if invoice already exists for this order
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      sendError(res, 'Invoice already exists for this order', 400, 'INVOICE_EXISTS');
      return;
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = new Invoice({
      invoiceNumber,
      orderId,
      clientId: order.clientId,
      commercialId: order.commercialId,
      amountDue: order.total,
      amountPaid: 0,
      isPaid: false,
      dueDate,
      payments: []
    });

    await invoice.save();

    // Update order with invoice reference
    order.invoiceId = invoice._id;
    await order.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'invoice', invoice._id.toString(), {
        invoiceNumber: invoice.invoiceNumber,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        amount: invoice.amountDue
      });
    }

    logger.info(`Invoice created: ${invoice.invoiceNumber} by ${req.user?.email}`);

    sendSuccess(res, invoice, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice
 * PUT /api/admin/invoices/:id
 */
export const updateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dueDate, amountDue } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    // Don't allow editing paid invoices
    if (invoice.isPaid) {
      sendError(res, 'Cannot edit a paid invoice', 400, 'INVOICE_PAID');
      return;
    }

    // Update fields
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    if (amountDue !== undefined) {
      invoice.amountDue = amountDue;
      // Recalculate isPaid status
      invoice.isPaid = invoice.amountPaid >= amountDue;
    }

    await invoice.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'invoice', invoice._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`Invoice updated: ${invoice.invoiceNumber} by ${req.user?.email}`);

    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Add payment to invoice
 * POST /api/admin/invoices/:id/payments
 */
export const addPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, method, note } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    if (invoice.isPaid) {
      sendError(res, 'Invoice is already paid', 400, 'INVOICE_ALREADY_PAID');
      return;
    }

    if (amount <= 0) {
      sendError(res, 'Payment amount must be positive', 400, 'INVALID_AMOUNT');
      return;
    }

    const remainingAmount = invoice.amountDue - invoice.amountPaid;
    if (amount > remainingAmount) {
      sendError(
        res,
        `Payment amount exceeds remaining balance of ${remainingAmount}`,
        400,
        'AMOUNT_EXCEEDS_BALANCE'
      );
      return;
    }

    // Add payment
    invoice.payments.push({
      date: new Date(),
      amount,
      method,
      note,
      recordedBy: req.user?.userId
    });

    invoice.amountPaid += amount;

    // Update paid status
    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.isPaid = true;
    }

    await invoice.save();

    // Log payment
    if (req.user) {
      await logPayment(
        req.user.userId,
        'invoice',
        invoice._id.toString(),
        amount,
        {
          method,
          invoiceNumber: invoice.invoiceNumber,
          remainingBalance: invoice.amountDue - invoice.amountPaid
        }
      );
    }

    logger.info(
      `Payment of ${amount} added to invoice ${invoice.invoiceNumber} by ${req.user?.email}`
    );

    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark invoice as paid
 * PUT /api/admin/invoices/:id/mark-paid
 */
export const markAsPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { method, note } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    if (invoice.isPaid) {
      sendError(res, 'Invoice is already paid', 400, 'INVOICE_ALREADY_PAID');
      return;
    }

    const remainingAmount = invoice.amountDue - invoice.amountPaid;

    // Add final payment for remaining amount
    if (remainingAmount > 0) {
      invoice.payments.push({
        date: new Date(),
        amount: remainingAmount,
        method: method || 'cash',
        note: note || 'Full payment',
        recordedBy: req.user?.userId
      });

      invoice.amountPaid = invoice.amountDue;
    }

    invoice.isPaid = true;
    await invoice.save();

    // Log payment
    if (req.user) {
      await logPayment(
        req.user.userId,
        'invoice',
        invoice._id.toString(),
        remainingAmount,
        {
          method,
          invoiceNumber: invoice.invoiceNumber,
          action: 'marked_as_paid'
        }
      );
    }

    logger.info(`Invoice marked as paid: ${invoice.invoiceNumber} by ${req.user?.email}`);

    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate PDF for invoice
 * POST /api/admin/invoices/:id/generate-pdf
 */
export const generatePDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    const pdfPath = await generateInvoicePDF(invoice._id.toString());

    // Log action
    if (req.user) {
      await logUpdate(req.user.userId, 'invoice', invoice._id.toString(), {
        action: 'pdf_generated'
      });
    }

    logger.info(`PDF generated for invoice: ${invoice.invoiceNumber}`);

    sendSuccess(res, {
      message: 'PDF generated successfully',
      pdfPath
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete invoice
 * DELETE /api/admin/invoices/:id
 */
export const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      sendError(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
      return;
    }

    // Don't allow deletion of paid invoices
    if (invoice.isPaid) {
      sendError(res, 'Cannot delete a paid invoice', 400, 'INVOICE_PAID');
      return;
    }

    // Don't allow deletion if any payments have been made
    if (invoice.payments.length > 0) {
      sendError(res, 'Cannot delete invoice with payments', 400, 'HAS_PAYMENTS');
      return;
    }

    // Remove invoice reference from order
    if (invoice.orderId) {
      const order = await Order.findById(invoice.orderId);
      if (order) {
        order.invoiceId = undefined;
        await order.save();
      }
    }

    await invoice.deleteOne();

    // Log deletion
    if (req.user) {
      await logUpdate(req.user.userId, 'invoice', invoice._id.toString(), {
        action: 'deleted',
        invoiceNumber: invoice.invoiceNumber
      });
    }

    logger.info(`Invoice deleted: ${invoice.invoiceNumber} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice statistics
 * GET /api/admin/invoices/stats
 */
export const getInvoiceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$isPaid',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountDue' },
          totalPaid: { $sum: '$amountPaid' }
        }
      }
    ]);

    const formattedStats = {
      paid: stats.find(s => s._id === true) || { count: 0, totalAmount: 0, totalPaid: 0 },
      unpaid: stats.find(s => s._id === false) || { count: 0, totalAmount: 0, totalPaid: 0 }
    };

    // Calculate overdue invoices
    const overdueCount = await Invoice.countDocuments({
      isPaid: false,
      dueDate: { $lt: new Date() }
    });

    sendSuccess(res, {
      ...formattedStats,
      overdueCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to generate unique invoice number
 */
async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Count invoices created this month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthInvoicesCount = await Invoice.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const sequence = (monthInvoicesCount + 1).toString().padStart(5, '0');

  return `INV-${year}${month}-${sequence}`;
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceStats = exports.deleteInvoice = exports.generatePDF = exports.markAsPaid = exports.addPayment = exports.updateInvoice = exports.createInvoice = exports.getInvoiceById = exports.getInvoices = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const pdfService_1 = require("../services/pdfService");
const logger_1 = __importDefault(require("../config/logger"));
const mongoose_1 = require("mongoose");
/**
 * Get all invoices with pagination and filtering
 * GET /api/admin/invoices
 */
const getInvoices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const isPaid = req.query.isPaid;
        const clientId = req.query.clientId;
        const commercialId = req.query.commercialId;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (isPaid !== undefined)
            filter.isPaid = isPaid === 'true';
        if (clientId)
            filter.clientId = clientId;
        if (commercialId)
            filter.commercialId = commercialId;
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const [invoices, total] = await Promise.all([
            models_1.Invoice.find(filter)
                .populate('orderId', 'orderNumber total')
                .populate('clientId', 'name email')
                .populate('commercialId', 'name email')
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.Invoice.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, invoices, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoices = getInvoices;
/**
 * Get invoice by ID
 * GET /api/admin/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await models_1.Invoice.findById(req.params.id)
            .populate('orderId')
            .populate('clientId', 'name email')
            .populate('commercialId', 'name email')
            .populate('payments.recordedBy', 'name');
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceById = getInvoiceById;
/**
 * Create invoice from order
 * POST /api/admin/invoices
 */
const createInvoice = async (req, res, next) => {
    try {
        const { orderId, dueDate } = req.body;
        // Check if order exists
        const order = await models_1.Order.findById(orderId);
        if (!order) {
            (0, apiResponse_1.sendError)(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
            return;
        }
        // Check if invoice already exists for this order
        const existingInvoice = await models_1.Invoice.findOne({ orderId });
        if (existingInvoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice already exists for this order', 400, 'INVOICE_EXISTS');
            return;
        }
        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();
        const invoice = new models_1.Invoice({
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
            await (0, auditService_1.logCreate)(req.user.userId, 'invoice', invoice._id.toString(), {
                invoiceNumber: invoice.invoiceNumber,
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                amount: invoice.amountDue
            });
        }
        logger_1.default.info(`Invoice created: ${invoice.invoiceNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, invoice, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
/**
 * Update invoice
 * PUT /api/admin/invoices/:id
 */
const updateInvoice = async (req, res, next) => {
    try {
        const { dueDate, amountDue } = req.body;
        const invoice = await models_1.Invoice.findById(req.params.id);
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        // Don't allow editing paid invoices
        if (invoice.isPaid) {
            (0, apiResponse_1.sendError)(res, 'Cannot edit a paid invoice', 400, 'INVOICE_PAID');
            return;
        }
        // Update fields
        if (dueDate !== undefined)
            invoice.dueDate = dueDate;
        if (amountDue !== undefined) {
            invoice.amountDue = amountDue;
            // Recalculate isPaid status
            invoice.isPaid = invoice.amountPaid >= amountDue;
        }
        await invoice.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'invoice', invoice._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`Invoice updated: ${invoice.invoiceNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.updateInvoice = updateInvoice;
/**
 * Add payment to invoice
 * POST /api/admin/invoices/:id/payments
 */
const addPayment = async (req, res, next) => {
    try {
        const { amount, method, note } = req.body;
        const invoice = await models_1.Invoice.findById(req.params.id);
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        if (invoice.isPaid) {
            (0, apiResponse_1.sendError)(res, 'Invoice is already paid', 400, 'INVOICE_ALREADY_PAID');
            return;
        }
        if (amount <= 0) {
            (0, apiResponse_1.sendError)(res, 'Payment amount must be positive', 400, 'INVALID_AMOUNT');
            return;
        }
        const remainingAmount = invoice.amountDue - invoice.amountPaid;
        if (amount > remainingAmount) {
            (0, apiResponse_1.sendError)(res, `Payment amount exceeds remaining balance of ${remainingAmount}`, 400, 'AMOUNT_EXCEEDS_BALANCE');
            return;
        }
        // Add payment
        invoice.payments.push({
            date: new Date(),
            amount,
            method,
            note,
            recordedBy: req.user?.userId ? new mongoose_1.Types.ObjectId(req.user.userId) : undefined
        });
        invoice.amountPaid += amount;
        // Update paid status
        if (invoice.amountPaid >= invoice.amountDue) {
            invoice.isPaid = true;
        }
        await invoice.save();
        // Log payment
        if (req.user) {
            await (0, auditService_1.logPayment)(req.user.userId, 'invoice', invoice._id.toString(), amount, {
                method,
                invoiceNumber: invoice.invoiceNumber,
                remainingBalance: invoice.amountDue - invoice.amountPaid
            });
        }
        logger_1.default.info(`Payment of ${amount} added to invoice ${invoice.invoiceNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.addPayment = addPayment;
/**
 * Mark invoice as paid
 * PUT /api/admin/invoices/:id/mark-paid
 */
const markAsPaid = async (req, res, next) => {
    try {
        const { method, note } = req.body;
        const invoice = await models_1.Invoice.findById(req.params.id);
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        if (invoice.isPaid) {
            (0, apiResponse_1.sendError)(res, 'Invoice is already paid', 400, 'INVOICE_ALREADY_PAID');
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
                recordedBy: req.user?.userId ? new mongoose_1.Types.ObjectId(req.user.userId) : undefined
            });
            invoice.amountPaid = invoice.amountDue;
        }
        invoice.isPaid = true;
        await invoice.save();
        // Log payment
        if (req.user) {
            await (0, auditService_1.logPayment)(req.user.userId, 'invoice', invoice._id.toString(), remainingAmount, {
                method,
                invoiceNumber: invoice.invoiceNumber,
                action: 'marked_as_paid'
            });
        }
        logger_1.default.info(`Invoice marked as paid: ${invoice.invoiceNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.markAsPaid = markAsPaid;
/**
 * Generate PDF for invoice
 * POST /api/admin/invoices/:id/generate-pdf
 */
const generatePDF = async (req, res, next) => {
    try {
        const invoice = await models_1.Invoice.findById(req.params.id);
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        const pdfPath = await (0, pdfService_1.generateInvoicePDF)(invoice._id.toString());
        // Log action
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'invoice', invoice._id.toString(), {
                action: 'pdf_generated'
            });
        }
        logger_1.default.info(`PDF generated for invoice: ${invoice.invoiceNumber}`);
        (0, apiResponse_1.sendSuccess)(res, {
            message: 'PDF generated successfully',
            pdfPath
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generatePDF = generatePDF;
/**
 * Delete invoice
 * DELETE /api/admin/invoices/:id
 */
const deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await models_1.Invoice.findById(req.params.id);
        if (!invoice) {
            (0, apiResponse_1.sendError)(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
            return;
        }
        // Don't allow deletion of paid invoices
        if (invoice.isPaid) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete a paid invoice', 400, 'INVOICE_PAID');
            return;
        }
        // Don't allow deletion if any payments have been made
        if (invoice.payments.length > 0) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete invoice with payments', 400, 'HAS_PAYMENTS');
            return;
        }
        // Remove invoice reference from order
        if (invoice.orderId) {
            const order = await models_1.Order.findById(invoice.orderId);
            if (order) {
                order.invoiceId = undefined;
                await order.save();
            }
        }
        await invoice.deleteOne();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'invoice', invoice._id.toString(), {
                action: 'deleted',
                invoiceNumber: invoice.invoiceNumber
            });
        }
        logger_1.default.info(`Invoice deleted: ${invoice.invoiceNumber} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoice = deleteInvoice;
/**
 * Get invoice statistics
 * GET /api/admin/invoices/stats
 */
const getInvoiceStats = async (_req, res, next) => {
    try {
        const stats = await models_1.Invoice.aggregate([
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
        const overdueCount = await models_1.Invoice.countDocuments({
            isPaid: false,
            dueDate: { $lt: new Date() }
        });
        (0, apiResponse_1.sendSuccess)(res, {
            ...formattedStats,
            overdueCount
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceStats = getInvoiceStats;
/**
 * Helper function to generate unique invoice number
 */
async function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // Count invoices created this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthInvoicesCount = await models_1.Invoice.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const sequence = (monthInvoicesCount + 1).toString().padStart(5, '0');
    return `INV-${year}${month}-${sequence}`;
}
//# sourceMappingURL=invoiceController.js.map
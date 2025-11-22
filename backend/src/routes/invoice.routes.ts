import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';
import { authenticate, adminOnly, adminOrCommercial } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { objectIdSchema, paginationSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createInvoiceSchema = Joi.object({
  orderId: objectIdSchema.required(),
  dueDate: Joi.date()
});

const updateInvoiceSchema = Joi.object({
  dueDate: Joi.date(),
  amountDue: Joi.number().min(0)
});

const addPaymentSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('cash', 'card', 'check', 'transfer').required(),
  note: Joi.string().allow('', null)
});

const markAsPaidSchema = Joi.object({
  method: Joi.string().valid('cash', 'card', 'check', 'transfer'),
  note: Joi.string().allow('', null)
});

const getInvoicesQuerySchema = paginationSchema.keys({
  isPaid: Joi.string().valid('true', 'false'),
  clientId: objectIdSchema,
  commercialId: objectIdSchema,
  search: Joi.string()
});

/**
 * @route   GET /api/admin/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private (Admin or Commercial)
 */
router.get('/stats', adminOrCommercial, invoiceController.getInvoiceStats);

/**
 * @route   GET /api/admin/invoices
 * @desc    Get all invoices with pagination
 * @access  Private (Admin or Commercial)
 */
router.get('/', adminOrCommercial, validateQuery(getInvoicesQuerySchema), invoiceController.getInvoices);

/**
 * @route   GET /api/admin/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private (Admin or Commercial)
 */
router.get('/:id', adminOrCommercial, invoiceController.getInvoiceById);

/**
 * @route   POST /api/admin/invoices
 * @desc    Create invoice from order
 * @access  Private (Admin or Commercial)
 */
router.post('/', adminOrCommercial, validate(createInvoiceSchema), invoiceController.createInvoice);

/**
 * @route   POST /api/admin/invoices/:id/payments
 * @desc    Add payment to invoice
 * @access  Private (Admin or Commercial)
 */
router.post('/:id/payments', adminOrCommercial, validate(addPaymentSchema), invoiceController.addPayment);

/**
 * @route   POST /api/admin/invoices/:id/generate-pdf
 * @desc    Generate PDF for invoice
 * @access  Private (Admin or Commercial)
 */
router.post('/:id/generate-pdf', adminOrCommercial, invoiceController.generatePDF);

/**
 * @route   PUT /api/admin/invoices/:id
 * @desc    Update invoice
 * @access  Private (Admin only)
 */
router.put('/:id', adminOnly, validate(updateInvoiceSchema), invoiceController.updateInvoice);

/**
 * @route   PUT /api/admin/invoices/:id/mark-paid
 * @desc    Mark invoice as paid
 * @access  Private (Admin or Commercial)
 */
router.put('/:id/mark-paid', adminOrCommercial, validate(markAsPaidSchema), invoiceController.markAsPaid);

/**
 * @route   DELETE /api/admin/invoices/:id
 * @desc    Delete invoice
 * @access  Private (Admin only)
 */
router.delete('/:id', adminOnly, invoiceController.deleteInvoice);

export default router;

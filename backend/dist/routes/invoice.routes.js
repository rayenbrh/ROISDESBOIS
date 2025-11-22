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
const invoiceController = __importStar(require("../controllers/invoiceController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Validation schemas
const createInvoiceSchema = joi_1.default.object({
    orderId: validate_2.objectIdSchema.required(),
    dueDate: joi_1.default.date()
});
const updateInvoiceSchema = joi_1.default.object({
    dueDate: joi_1.default.date(),
    amountDue: joi_1.default.number().min(0)
});
const addPaymentSchema = joi_1.default.object({
    amount: joi_1.default.number().min(0).required(),
    method: joi_1.default.string().valid('cash', 'card', 'check', 'transfer').required(),
    note: joi_1.default.string().allow('', null)
});
const markAsPaidSchema = joi_1.default.object({
    method: joi_1.default.string().valid('cash', 'card', 'check', 'transfer'),
    note: joi_1.default.string().allow('', null)
});
const getInvoicesQuerySchema = validate_2.paginationSchema.keys({
    isPaid: joi_1.default.string().valid('true', 'false'),
    clientId: validate_2.objectIdSchema,
    commercialId: validate_2.objectIdSchema,
    search: joi_1.default.string()
});
/**
 * @route   GET /api/admin/invoices
 * @desc    Get all invoices with pagination
 * @access  Private (Admin or Commercial)
 */
router.get('/', auth_1.adminOrCommercial, (0, validate_1.validateQuery)(getInvoicesQuerySchema), invoiceController.getInvoices);
/**
 * @route   GET /api/admin/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private (Admin or Commercial)
 */
router.get('/:id', auth_1.adminOrCommercial, invoiceController.getInvoiceById);
/**
 * @route   POST /api/admin/invoices
 * @desc    Create invoice from order
 * @access  Private (Admin or Commercial)
 */
router.post('/', auth_1.adminOrCommercial, (0, validate_1.validate)(createInvoiceSchema), invoiceController.createInvoice);
/**
 * @route   POST /api/admin/invoices/:id/payments
 * @desc    Add payment to invoice
 * @access  Private (Admin or Commercial)
 */
router.post('/:id/payments', auth_1.adminOrCommercial, (0, validate_1.validate)(addPaymentSchema), invoiceController.addPayment);
/**
 * @route   POST /api/admin/invoices/:id/generate-pdf
 * @desc    Generate PDF for invoice
 * @access  Private (Admin or Commercial)
 */
router.post('/:id/generate-pdf', auth_1.adminOrCommercial, invoiceController.generatePDF);
/**
 * @route   PUT /api/admin/invoices/:id
 * @desc    Update invoice
 * @access  Private (Admin only)
 */
router.put('/:id', auth_1.adminOnly, (0, validate_1.validate)(updateInvoiceSchema), invoiceController.updateInvoice);
/**
 * @route   PUT /api/admin/invoices/:id/mark-paid
 * @desc    Mark invoice as paid
 * @access  Private (Admin or Commercial)
 */
router.put('/:id/mark-paid', auth_1.adminOrCommercial, (0, validate_1.validate)(markAsPaidSchema), invoiceController.markAsPaid);
/**
 * @route   DELETE /api/admin/invoices/:id
 * @desc    Delete invoice
 * @access  Private (Admin only)
 */
router.delete('/:id', auth_1.adminOnly, invoiceController.deleteInvoice);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map
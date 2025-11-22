import { Request, Response, NextFunction } from 'express';
/**
 * Get all invoices with pagination and filtering
 * GET /api/admin/invoices
 */
export declare const getInvoices: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get invoice by ID
 * GET /api/admin/invoices/:id
 */
export declare const getInvoiceById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create invoice from order
 * POST /api/admin/invoices
 */
export declare const createInvoice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update invoice
 * PUT /api/admin/invoices/:id
 */
export declare const updateInvoice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Add payment to invoice
 * POST /api/admin/invoices/:id/payments
 */
export declare const addPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Mark invoice as paid
 * PUT /api/admin/invoices/:id/mark-paid
 */
export declare const markAsPaid: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate PDF for invoice
 * POST /api/admin/invoices/:id/generate-pdf
 */
export declare const generatePDF: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete invoice
 * DELETE /api/admin/invoices/:id
 */
export declare const deleteInvoice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get invoice statistics
 * GET /api/admin/invoices/stats
 */
export declare const getInvoiceStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=invoiceController.d.ts.map
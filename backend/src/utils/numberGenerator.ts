import { Order, Invoice } from '../models';

/**
 * Generate unique order number in format: ROI-ORD-YYYY-XXXXX
 */
export const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `ROI-ORD-${year}`;

  // Find the latest order number for this year
  const latestOrder = await Order.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber');

  let nextNumber = 1;

  if (latestOrder) {
    const match = latestOrder.orderNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const paddedNumber = nextNumber.toString().padStart(5, '0');
  return `${prefix}-${paddedNumber}`;
};

/**
 * Generate unique invoice number in format: ROI-INV-YYYY-XXXX
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `ROI-INV-${year}`;

  // Find the latest invoice number for this year
  const latestInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}`)
  })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber');

  let nextNumber = 1;

  if (latestInvoice) {
    const match = latestInvoice.invoiceNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}-${paddedNumber}`;
};

/**
 * Generate unique SKU
 */
export const generateSKU = (prefix: string = 'ROI'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSKU = exports.generateInvoiceNumber = exports.generateOrderNumber = void 0;
const models_1 = require("../models");
/**
 * Generate unique order number in format: ROI-ORD-YYYY-XXXXX
 */
const generateOrderNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `ROI-ORD-${year}`;
    // Find the latest order number for this year
    const latestOrder = await models_1.Order.findOne({
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
exports.generateOrderNumber = generateOrderNumber;
/**
 * Generate unique invoice number in format: ROI-INV-YYYY-XXXX
 */
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `ROI-INV-${year}`;
    // Find the latest invoice number for this year
    const latestInvoice = await models_1.Invoice.findOne({
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
exports.generateInvoiceNumber = generateInvoiceNumber;
/**
 * Generate unique SKU
 */
const generateSKU = (prefix = 'ROI') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};
exports.generateSKU = generateSKU;
//# sourceMappingURL=numberGenerator.js.map
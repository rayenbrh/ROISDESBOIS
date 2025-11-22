import { Order, POSSale, Settings } from '../models/index.js';
import {
  generateInvoicePDF,
  generateReceiptPDF,
  generateProductionSheetPDF,
} from '../utils/pdfGenerator.js';

// @desc    Generate and download invoice PDF
// @route   GET /api/pdf/invoice/:orderId
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const settings = await Settings.getSettings();
    const pdfBuffer = await generateInvoicePDF(order, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
    });
  }
};

// @desc    Generate and download POS receipt PDF
// @route   GET /api/pdf/receipt/:saleId
// @access  Private
export const downloadReceipt = async (req, res) => {
  try {
    const sale = await POSSale.findById(req.params.saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    const settings = await Settings.getSettings();
    const pdfBuffer = await generateReceiptPDF(sale, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale.saleNumber}.pdf`);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
    });
  }
};

// @desc    Generate and download production sheet PDF
// @route   GET /api/pdf/production-sheet/:orderId
// @access  Private
export const downloadProductionSheet = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const settings = await Settings.getSettings();
    const pdfBuffer = await generateProductionSheetPDF(order, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=production-${order.orderNumber}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download production sheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate production sheet',
    });
  }
};

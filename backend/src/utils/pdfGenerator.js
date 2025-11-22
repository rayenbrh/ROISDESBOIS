import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Invoice PDF
 */
export const generateInvoicePDF = async (order, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate QR Code
      const qrCodeData = `Order: ${order.orderNumber}\nTotal: ${order.total} ${settings.currency}`;
      const qrCode = await QRCode.toDataURL(qrCodeData);
      const qrBuffer = Buffer.from(qrCode.split(',')[1], 'base64');

      // Header
      doc.fontSize(24).text(settings.companyName || 'Les Rois des Bois', { align: 'center' });

      if (settings.logo && fs.existsSync(path.join(__dirname, '../../', settings.logo))) {
        try {
          doc.image(path.join(__dirname, '../../', settings.logo), 50, 50, { width: 80 });
        } catch (err) {
          console.log('Logo not found');
        }
      }

      // QR Code
      doc.image(qrBuffer, 480, 50, { width: 80 });

      doc.moveDown();
      doc.fontSize(18).text('فاتورة / Invoice', { align: 'center' });
      doc.moveDown();

      // Company Info
      doc.fontSize(10);
      if (settings.address) {
        doc.text(
          `${settings.address.street || ''}, ${settings.address.city || ''}, ${settings.address.state || ''}`,
          { align: 'center' }
        );
      }
      if (settings.phone) doc.text(`Tel: ${settings.phone}`, { align: 'center' });
      if (settings.email) doc.text(`Email: ${settings.email}`, { align: 'center' });

      doc.moveDown(2);

      // Order Information
      const infoY = doc.y;
      doc.fontSize(12);
      doc.text(`Order Number: ${order.orderNumber}`, 50, infoY);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, 50);

      // Customer Information
      doc.text(`Customer: ${order.customer.name}`, 300, infoY);
      doc.text(`Phone: ${order.customer.phone}`, 300);
      if (order.customer.email) doc.text(`Email: ${order.customer.email}`, 300);

      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Item', 50, tableTop, { width: 200 });
      doc.text('Qty', 260, tableTop, { width: 50 });
      doc.text('Unit Price', 320, tableTop, { width: 80 });
      doc.text('Total', 410, tableTop, { width: 80 });

      // Draw line under header
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();

      // Table Items
      let currentY = tableTop + 30;
      order.items.forEach((item) => {
        doc.text(item.name, 50, currentY, { width: 200 });
        doc.text(item.quantity.toString(), 260, currentY, { width: 50 });
        doc.text(`${item.unitPrice.toFixed(2)}`, 320, currentY, { width: 80 });
        doc.text(`${item.total.toFixed(2)}`, 410, currentY, { width: 80 });

        currentY += 25;

        // Add page if needed
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      });

      // Draw line before totals
      doc
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 20;

      // Totals
      doc.fontSize(11);
      doc.text('Subtotal:', 350, currentY);
      doc.text(`${order.subtotal.toFixed(2)} ${settings.currency}`, 450, currentY);

      if (order.tax > 0) {
        currentY += 20;
        doc.text(`Tax (${order.taxRate}%):`, 350, currentY);
        doc.text(`${order.tax.toFixed(2)} ${settings.currency}`, 450, currentY);
      }

      if (order.discount > 0) {
        currentY += 20;
        doc.text('Discount:', 350, currentY);
        doc.text(`-${order.discount.toFixed(2)} ${settings.currency}`, 450, currentY);
      }

      currentY += 20;
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Total:', 350, currentY);
      doc.text(`${order.total.toFixed(2)} ${settings.currency}`, 450, currentY);

      // Payment Info
      currentY += 30;
      doc.fontSize(10).font('Helvetica');
      doc.text(`Payment Status: ${order.paymentStatus}`, 50, currentY);
      doc.text(`Amount Paid: ${order.amountPaid.toFixed(2)} ${settings.currency}`, 50);

      if (order.balanceRemaining > 0) {
        doc.text(`Balance: ${order.balanceRemaining.toFixed(2)} ${settings.currency}`, 50);
      }

      // Footer
      if (settings.invoiceFooter) {
        doc.fontSize(10).text(settings.invoiceFooter, 50, 750, {
          align: 'center',
          width: 500,
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate POS Receipt PDF
 */
export const generateReceiptPDF = async (sale, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [226.77, 841.89], margin: 10 }); // 80mm thermal width
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(14).text(settings.companyName || 'Les Rois des Bois', { align: 'center' });
      doc.fontSize(8);

      if (settings.phone) doc.text(`Tel: ${settings.phone}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).text('Receipt / وصل', { align: 'center' });
      doc.moveDown();

      // Sale Info
      doc.fontSize(8);
      doc.text(`Sale: ${sale.saleNumber}`);
      doc.text(`Date: ${new Date(sale.createdAt).toLocaleString('en-GB')}`);
      if (sale.customerName) doc.text(`Customer: ${sale.customerName}`);
      doc.moveDown();

      // Items
      doc.text('-------------------------------------------');
      sale.items.forEach((item) => {
        doc.text(`${item.name}`);
        doc.text(
          `  ${item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}`,
          { indent: 10 }
        );
      });
      doc.text('-------------------------------------------');

      // Totals
      doc.text(`Subtotal: ${sale.subtotal.toFixed(2)} ${settings.currency}`);
      if (sale.tax > 0) doc.text(`Tax: ${sale.tax.toFixed(2)} ${settings.currency}`);
      if (sale.discount > 0) doc.text(`Discount: -${sale.discount.toFixed(2)} ${settings.currency}`);
      doc.fontSize(10).text(`TOTAL: ${sale.total.toFixed(2)} ${settings.currency}`);
      doc.fontSize(8);
      doc.text(`Paid: ${sale.amountPaid.toFixed(2)} ${settings.currency}`);
      doc.text(`Change: ${sale.change.toFixed(2)} ${settings.currency}`);
      doc.moveDown();

      // Generate QR Code
      const qrCodeData = `Sale: ${sale.saleNumber}\nTotal: ${sale.total} ${settings.currency}`;
      const qrCode = await QRCode.toDataURL(qrCodeData);
      const qrBuffer = Buffer.from(qrCode.split(',')[1], 'base64');
      doc.image(qrBuffer, 60, doc.y, { width: 100 });

      doc.moveDown(7);
      doc.fontSize(8).text('Thank you! شكراً', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Production Sheet PDF
 */
export const generateProductionSheetPDF = async (order, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('PRODUCTION SHEET', { align: 'center' });
      doc.fontSize(16).text('ورقة الإنتاج', { align: 'center' });
      doc.moveDown(2);

      // Order Info
      doc.fontSize(12);
      doc.text(`Order Number: ${order.orderNumber}`, 50);
      doc.text(`Customer: ${order.customer.name}`, 50);
      doc.text(`Phone: ${order.customer.phone}`, 50);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, 50);

      if (order.estimatedDeliveryDate) {
        doc.text(
          `Delivery Date: ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-GB')}`,
          50
        );
      }

      doc.moveDown(2);

      // Items to Produce
      doc.fontSize(14).text('Items to Produce:', { underline: true });
      doc.moveDown();

      let currentY = doc.y;

      for (const item of order.items) {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`${item.name} - Quantity: ${item.quantity}`, 50, currentY);
        currentY += 20;

        // If configurable product, show components
        if (item.components && item.components.length > 0) {
          doc.fontSize(10).font('Helvetica');
          doc.text('Components Required:', 70, currentY);
          currentY += 15;

          item.components.forEach((component) => {
            doc.text(
              `- ${component.name}: ${component.quantityRequired * item.quantity} units`,
              90,
              currentY
            );
            currentY += 15;
          });
        }

        currentY += 10;

        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      }

      // Notes
      if (order.notes || order.internalNotes) {
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Notes:');
        doc.fontSize(10).font('Helvetica');
        if (order.notes) doc.text(`Customer Notes: ${order.notes}`);
        if (order.internalNotes) doc.text(`Internal Notes: ${order.internalNotes}`);
      }

      // Checkboxes
      doc.moveDown(2);
      doc.fontSize(12);
      const checkY = doc.y;
      doc.text('☐ Materials Prepared', 50, checkY);
      doc.text('☐ Production Complete', 50, checkY + 20);
      doc.text('☐ Quality Check', 50, checkY + 40);
      doc.text('☐ Packaging Complete', 50, checkY + 60);
      doc.text('☐ Ready for Delivery', 50, checkY + 80);

      // Signature
      doc.fontSize(10);
      doc.text('Produced by: _______________', 300, checkY + 60);
      doc.text('Date: _______________', 300, checkY + 80);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

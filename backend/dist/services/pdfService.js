"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProductionSheet = exports.generateInvoicePDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const models_1 = require("../models");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Get or create PDF directory
 */
const ensurePdfDir = async (subDir = '') => {
    const dir = path_1.default.join('uploads', 'pdfs', subDir);
    await promises_1.default.mkdir(dir, { recursive: true });
    return dir;
};
/**
 * Format number for Arabic locale
 */
const formatArabicNumber = (num, currency = 'TND') => {
    return new Intl.NumberFormat('ar-TN', {
        style: 'currency',
        currency
    }).format(num);
};
/**
 * Generate invoice HTML template
 */
const generateInvoiceHTML = (invoice, settings) => {
    const { order, client, commercial } = invoice;
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      direction: rtl;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 3px solid #D4AF37;
      padding-bottom: 20px;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #D4AF37;
      margin-bottom: 10px;
    }

    .company-details {
      font-size: 12px;
      color: #666;
    }

    .logo {
      max-width: 150px;
      max-height: 80px;
    }

    .invoice-title {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 30px;
      color: #0E0E0E;
    }

    .invoice-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .meta-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }

    .meta-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 10px;
      color: #D4AF37;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 12px;
    }

    .meta-label {
      font-weight: 600;
      color: #666;
    }

    .table-container {
      margin-bottom: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    th {
      background: #0E0E0E;
      color: white;
      padding: 12px;
      text-align: right;
      font-weight: 600;
      font-size: 13px;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .totals-section {
      margin-right: auto;
      margin-left: 0;
      max-width: 400px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .total-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #D4AF37;
      padding-top: 10px;
      border-top: 2px solid #D4AF37;
      margin-top: 10px;
    }

    .payment-section {
      margin-top: 30px;
      padding: 20px;
      background: #e8f5e9;
      border-radius: 8px;
    }

    .payment-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 15px;
      color: #2e7d32;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #D4AF37;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    .amount-in-words {
      margin-top: 20px;
      padding: 15px;
      background: #fff3cd;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-paid {
      background: #d4edda;
      color: #155724;
    }

    .status-unpaid {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <div class="company-name">${settings.companyName.ar}</div>
        <div class="company-details">
          ${settings.address?.ar || ''}<br>
          ${settings.phone ? `هاتف: ${settings.phone}` : ''}<br>
          ${settings.email ? `بريد إلكتروني: ${settings.email}` : ''}<br>
          ${settings.taxNumber ? `الرقم الجبائي: ${settings.taxNumber}` : ''}
        </div>
      </div>
      ${settings.logoPath ? `<img src="file://${path_1.default.resolve(settings.logoPath)}" class="logo" alt="Logo">` : ''}
    </div>

    <!-- Invoice Title -->
    <div class="invoice-title">
      فاتورة رقم ${invoice.invoiceNumber}
      <span class="status-badge ${invoice.isPaid ? 'status-paid' : 'status-unpaid'}">
        ${invoice.isPaid ? 'مدفوعة' : 'غير مدفوعة'}
      </span>
    </div>

    <!-- Meta Information -->
    <div class="invoice-meta">
      <div class="meta-section">
        <div class="meta-title">معلومات الفاتورة</div>
        <div class="meta-row">
          <span class="meta-label">رقم الفاتورة:</span>
          <span>${invoice.invoiceNumber}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">رقم الطلب:</span>
          <span>${order.orderNumber}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">تاريخ الإصدار:</span>
          <span>${new Date(invoice.createdAt).toLocaleDateString('ar-TN')}</span>
        </div>
        ${invoice.dueDate ? `
        <div class="meta-row">
          <span class="meta-label">تاريخ الاستحقاق:</span>
          <span>${new Date(invoice.dueDate).toLocaleDateString('ar-TN')}</span>
        </div>
        ` : ''}
      </div>

      <div class="meta-section">
        <div class="meta-title">معلومات العميل</div>
        ${client ? `
        <div class="meta-row">
          <span class="meta-label">الاسم:</span>
          <span>${client.name.first} ${client.name.last || ''}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">البريد الإلكتروني:</span>
          <span>${client.email}</span>
        </div>
        ` : '<div>عميل عام</div>'}
        ${commercial ? `
        <div class="meta-row">
          <span class="meta-label">المندوب التجاري:</span>
          <span>${commercial.name.first} ${commercial.name.last || ''}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40%">المنتج</th>
            <th style="width: 15%">الكمية</th>
            <th style="width: 20%">سعر الوحدة</th>
            <th style="width: 25%">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${order.lines.map(line => `
            <tr>
              <td>
                <strong>${line.productTitle.ar}</strong>
                ${line.variantId ? `<br><small>نوع: ${line.variantId}</small>` : ''}
                ${line.componentSelections ? '<br><small>منتج قابل للتخصيص</small>' : ''}
              </td>
              <td>${line.qty}</td>
              <td>${formatArabicNumber(line.unitPrice, settings.currency)}</td>
              <td><strong>${formatArabicNumber(line.lineTotal, settings.currency)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span>المجموع الفرعي:</span>
        <span>${formatArabicNumber(order.subtotal, settings.currency)}</span>
      </div>
      ${order.remise > 0 ? `
      <div class="total-row">
        <span>التخفيض:</span>
        <span>-${formatArabicNumber(order.remise, settings.currency)}</span>
      </div>
      ` : ''}
      <div class="total-row">
        <span>الضريبة (${settings.taxPercent}%):</span>
        <span>${formatArabicNumber(order.tax, settings.currency)}</span>
      </div>
      <div class="total-row grand-total">
        <span>المجموع الكلي:</span>
        <span>${formatArabicNumber(order.total, settings.currency)}</span>
      </div>
    </div>

    <!-- Amount in Words -->
    <div class="amount-in-words">
      المبلغ الإجمالي: ${order.total.toFixed(2)} ${settings.currency}
    </div>

    <!-- Payments -->
    ${invoice.payments.length > 0 ? `
    <div class="payment-section">
      <div class="payment-title">سجل المدفوعات</div>
      ${invoice.payments.map(payment => `
        <div class="payment-row">
          <span>${new Date(payment.date).toLocaleDateString('ar-TN')} - ${payment.method}</span>
          <span><strong>${formatArabicNumber(payment.amount, settings.currency)}</strong></span>
        </div>
        ${payment.note ? `<div style="font-size: 11px; color: #666; margin-bottom: 5px;">${payment.note}</div>` : ''}
      `).join('')}
      <div class="payment-row" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ccc;">
        <span>المبلغ المتبقي:</span>
        <span><strong>${formatArabicNumber(invoice.amountDue - invoice.amountPaid, settings.currency)}</strong></span>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      ${settings.invoiceFooter?.ar || 'شكراً لثقتكم بنا'}
      <br><br>
      <small>تم إنشاء هذه الفاتورة إلكترونياً بواسطة نظام إدارة Les Rois des Bois</small>
    </div>
  </div>
</body>
</html>
  `;
};
/**
 * Generate invoice PDF
 */
const generateInvoicePDF = async (invoiceId) => {
    try {
        const invoice = await models_1.Invoice.findById(invoiceId)
            .populate('orderId')
            .populate('clientId')
            .populate('commercialId');
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        const settings = await models_1.Settings.findOne() || {};
        const html = generateInvoiceHTML(invoice, settings);
        // Launch Puppeteer
        const browser = await puppeteer_1.default.launch({
            headless: process.env.PUPPETEER_HEADLESS !== 'false',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        // Generate PDF
        const pdfDir = await ensurePdfDir('invoices');
        const pdfPath = path_1.default.join(pdfDir, `${invoice.invoiceNumber}.pdf`);
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        await browser.close();
        // Update invoice with PDF path
        invoice.pdfPath = pdfPath;
        await invoice.save();
        logger_1.default.info(`Invoice PDF generated: ${pdfPath}`);
        return pdfPath;
    }
    catch (error) {
        logger_1.default.error('PDF generation error:', error);
        throw new Error('Failed to generate invoice PDF');
    }
};
exports.generateInvoicePDF = generateInvoicePDF;
/**
 * Generate production sheet PDF
 */
const generateProductionSheet = async (orderId) => {
    try {
        const order = await models_1.Order.findById(orderId).populate({
            path: 'lines.productId',
            populate: {
                path: 'specialConfig.components.subProductIds'
            }
        });
        if (!order) {
            throw new Error('Order not found');
        }
        // Build production sheet HTML (simplified version)
        const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>ورقة الإنتاج - ${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; }
    h1 { color: #D4AF37; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
    th { background: #0E0E0E; color: white; }
  </style>
</head>
<body>
  <h1>ورقة إنتاج - طلب رقم ${order.orderNumber}</h1>
  <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-TN')}</p>
  <p><strong>الحالة:</strong> ${order.status}</p>

  <table>
    <thead>
      <tr>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>المكونات المطلوبة</th>
      </tr>
    </thead>
    <tbody>
      ${order.lines.map(line => `
        <tr>
          <td>${line.productTitle.ar}</td>
          <td>${line.qty}</td>
          <td>
            ${line.componentSelections
            ? Object.entries(line.componentSelections).map(([key, value]) => `${key}: ${value}`).join('<br>')
            : 'منتج قياسي'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;
        const browser = await puppeteer_1.default.launch({
            headless: process.env.PUPPETEER_HEADLESS !== 'false',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfDir = await ensurePdfDir('production');
        const pdfPath = path_1.default.join(pdfDir, `production-${order.orderNumber}.pdf`);
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        });
        await browser.close();
        // Update order with production sheet path
        order.productionSheetPath = pdfPath;
        await order.save();
        logger_1.default.info(`Production sheet generated: ${pdfPath}`);
        return pdfPath;
    }
    catch (error) {
        logger_1.default.error('Production sheet generation error:', error);
        throw new Error('Failed to generate production sheet');
    }
};
exports.generateProductionSheet = generateProductionSheet;
//# sourceMappingURL=pdfService.js.map
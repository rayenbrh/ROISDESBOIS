import express from 'express';
import {
  downloadInvoice,
  downloadReceipt,
  downloadProductionSheet,
} from '../controllers/pdfController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/invoice/:orderId', authenticate, downloadInvoice);
router.get('/receipt/:saleId', authenticate, downloadReceipt);
router.get('/production-sheet/:orderId', authenticate, downloadProductionSheet);

export default router;

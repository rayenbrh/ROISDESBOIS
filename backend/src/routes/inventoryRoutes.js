import express from 'express';
import {
  getInventoryLogs,
  getProductInventoryLogs,
  adjustStock,
  getInventorySummary,
  getStockAlerts,
} from '../controllers/inventoryController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', authenticate, getInventoryLogs);
router.get('/logs/product/:productId', authenticate, getProductInventoryLogs);
router.get('/summary', authenticate, getInventorySummary);
router.get('/alerts', authenticate, getStockAlerts);
router.post('/adjust', authenticate, requireAdmin, adjustStock);

export default router;

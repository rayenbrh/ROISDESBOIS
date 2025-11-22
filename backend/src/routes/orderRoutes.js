import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderStats,
} from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/summary', authenticate, getOrderStats);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);
router.put('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, requireAdmin, cancelOrder);

export default router;

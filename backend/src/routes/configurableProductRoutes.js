import express from 'express';
import {
  getConfigurableProducts,
  getConfigurableProductById,
  createConfigurableProduct,
  updateConfigurableProduct,
  deleteConfigurableProduct,
  checkConfigurableProductStock,
  recalculateAllPrices,
  uploadConfigurableProductImages,
} from '../controllers/configurableProductController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Authenticated routes
router.get('/', authenticate, getConfigurableProducts);
router.get('/:id', authenticate, getConfigurableProductById);
router.get('/:id/check-stock', authenticate, checkConfigurableProductStock);

// Admin only routes
router.post('/', authenticate, requireAdmin, createConfigurableProduct);
router.put('/:id', authenticate, requireAdmin, updateConfigurableProduct);
router.delete('/:id', authenticate, requireAdmin, deleteConfigurableProduct);
router.post('/recalculate-prices', authenticate, requireAdmin, recalculateAllPrices);
router.post(
  '/:id/images',
  authenticate,
  requireAdmin,
  upload.array('images', 5),
  uploadConfigurableProductImages
);

export default router;

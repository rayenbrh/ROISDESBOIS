import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getCategories,
  getLowStockProducts,
} from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public or authenticated routes
router.get('/categories/list', authenticate, getCategories);
router.get('/low-stock/alert', authenticate, getLowStockProducts);
router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProductById);

// Admin only routes
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.post(
  '/:id/images',
  authenticate,
  requireAdmin,
  upload.array('images', 5),
  uploadProductImages
);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, deleteProductImage);

export default router;

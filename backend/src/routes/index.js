import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import configurableProductRoutes from './configurableProductRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import posRoutes from './posRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import pdfRoutes from './pdfRoutes.js';

export default function setupRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/configurable-products', configurableProductRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/pos-sales', posRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/pdf', pdfRoutes);
}

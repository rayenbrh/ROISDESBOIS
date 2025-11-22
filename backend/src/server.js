import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import setupRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// ES Module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Les Rois des Bois Backend is running!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
setupRoutes(app);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║           🌲 LES ROIS DES BOIS - BACKEND SERVER 🌲           ║
  ║                                                               ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                                  ║
  ║   Server running on port: ${PORT}                              ║
  ║   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}            ║
  ║                                                               ║
  ║   📚 API Documentation: http://localhost:${PORT}/api          ║
  ║   🏥 Health Check: http://localhost:${PORT}/health            ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

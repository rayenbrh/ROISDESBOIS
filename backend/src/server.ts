import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis (optional - for queue)
    if (process.env.USE_QUEUE === 'true') {
      await connectRedis();
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          const mongoose = await import('mongoose');
          await mongoose.connection.close();
          logger.info('Database connection closed');

          if (process.env.USE_QUEUE === 'true') {
            const { disconnectRedis } = await import('./config/redis');
            await disconnectRedis();
            logger.info('Redis connection closed');
          }

          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

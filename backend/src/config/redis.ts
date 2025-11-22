import { createClient } from 'redis';
import logger from './logger';

let redisClient: ReturnType<typeof createClient> | null = null;

// Only create Redis client if queue is enabled
if (process.env.USE_QUEUE === 'true') {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    },
    password: process.env.REDIS_PASSWORD || undefined
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });
}

export const connectRedis = async (): Promise<void> => {
  if (process.env.USE_QUEUE === 'true' && redisClient) {
    try {
      await redisClient.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Don't exit - queue is optional
    }
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;

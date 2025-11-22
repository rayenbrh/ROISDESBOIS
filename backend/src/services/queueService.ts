import Bull from 'bull';
import { Product, SubProduct } from '../models';
import { compositeImages } from './imageService';
import logger from '../config/logger';
import path from 'path';
import { CompositeMode } from '../types';

interface CompositeJobData {
  productId: string;
  mapping: Record<string, string>; // { componentKey: subProductId }
}

// Only create queue if USE_QUEUE is enabled
let compositeQueue: Bull.Queue<CompositeJobData> | null = null;

if (process.env.USE_QUEUE === 'true') {
  // Create Bull queue for composite image generation
  compositeQueue = new Bull<CompositeJobData>('composite-images', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  /**
   * Process composite image generation jobs
   */
  compositeQueue.process(async (job) => {
    const { productId, mapping } = job.data;

    logger.info(`Processing composite image job for product ${productId}`);

    try {
      // Fetch product
      const product = await Product.findById(productId);
      if (!product || !product.isSpecial) {
        throw new Error('Product not found or not a special product');
      }

      // Fetch all subproducts in the mapping
      const subProductIds = Object.values(mapping);
      const subProducts = await SubProduct.find({ _id: { $in: subProductIds } });

      if (subProducts.length !== subProductIds.length) {
        throw new Error('Some subproducts not found');
      }

      // Build image paths array in order of component keys
      const imagePaths: string[] = [];
      const componentKeys = Object.keys(mapping).sort(); // Consistent ordering

      for (const key of componentKeys) {
        const subProductId = mapping[key];
        const subProduct = subProducts.find(sp => sp._id.toString() === subProductId);

        if (!subProduct || !subProduct.images[0]) {
          throw new Error(`SubProduct ${subProductId} has no images`);
        }

        imagePaths.push(subProduct.images[0].path);
      }

      // Generate unique filename for composite
      const timestamp = Date.now();
      const hash = Object.values(mapping).join('-').substring(0, 20);
      const outputDir = path.join('uploads', 'composites');
      const outputFilename = `composite-${productId}-${hash}-${timestamp}.webp`;
      const outputPath = path.join(outputDir, outputFilename);

      // Create composite image
      await compositeImages(imagePaths, outputPath, 'overlay');

      // Update product's specialConfig with new combination image
      if (!product.specialConfig) {
        product.specialConfig = {
          components: [],
          compositeMode: CompositeMode.AUTO,
          combinationImages: []
        };
      }

      if (product.specialConfig) {
        if (!product.specialConfig.combinationImages) {
          product.specialConfig.combinationImages = [];
        }

        // Check if this mapping already exists
        const existingIndex = product.specialConfig.combinationImages.findIndex(
          (ci) => JSON.stringify(ci.mapping) === JSON.stringify(mapping)
        );

        if (existingIndex >= 0) {
          // Update existing
          product.specialConfig.combinationImages[existingIndex].imagePath = outputPath;
        } else {
          // Add new
          product.specialConfig.combinationImages.push({
            mapping,
            imagePath: outputPath
          });
        }
      }

      await product.save();

      logger.info(`Composite image generated and saved: ${outputPath}`);

      return {
        success: true,
        imagePath: outputPath,
        productId,
        mapping
      };
    } catch (error: any) {
      logger.error(`Composite image job failed:`, error);
      throw error;
    }
  });

  // Queue event listeners
  compositeQueue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed:`, result);
  });

  compositeQueue.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err.message);
  });

  compositeQueue.on('error', (error) => {
    logger.error('Queue error:', error);
  });
}

/**
 * Add composite image generation job to queue
 */
export const queueCompositeGeneration = async (
  productId: string,
  mapping: Record<string, string>
): Promise<Bull.Job<CompositeJobData> | null> => {
  if (!compositeQueue) {
    logger.warn('Queue is disabled. Cannot generate composite image.');
    return null;
  }

  const job = await compositeQueue.add({
    productId,
    mapping
  });

  logger.info(`Composite image job queued: ${job.id}`);

  return job;
};

/**
 * Get job status
 */
export const getJobStatus = async (jobId: string): Promise<any> => {
  if (!compositeQueue) {
    return { error: 'Queue is disabled' };
  }

  const job = await compositeQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  const returnValue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    result: returnValue,
    error: failedReason,
    data: job.data
  };
};

export { compositeQueue };
export default compositeQueue;

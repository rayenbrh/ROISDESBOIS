import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { processImages, deleteImage } from '../services/imageService';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs/promises';

/**
 * Upload images (generic endpoint)
 * POST /api/admin/uploads/images
 */
export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      sendError(res, 'No files uploaded', 400, 'NO_FILES');
      return;
    }

    const files = req.files as Express.Multer.File[];
    const category = req.body.category || 'general'; // products, subproducts, general, etc.

    const outputDir = path.join('uploads', category);

    // Process images
    const processedImages = await processImages(files, outputDir);

    logger.info(`${processedImages.length} images uploaded to ${category} by ${req.user?.email}`);

    sendSuccess(res, processedImages);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload single image
 * POST /api/admin/uploads/image
 */
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400, 'NO_FILE');
      return;
    }

    const category = req.body.category || 'general';
    const outputDir = path.join('uploads', category);

    // Process image
    const { processImage } = await import('../services/imageService');
    const processedImage = await processImage(req.file.path, outputDir);

    logger.info(`Image uploaded to ${category} by ${req.user?.email}`);

    sendSuccess(res, processedImage);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image
 * DELETE /api/admin/uploads/image
 */
export const deleteImageFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      sendError(res, 'Image path is required', 400, 'NO_PATH');
      return;
    }

    // Security check: ensure path is within uploads directory
    const normalizedPath = path.normalize(imagePath);
    if (!normalizedPath.startsWith('uploads/')) {
      sendError(res, 'Invalid image path', 400, 'INVALID_PATH');
      return;
    }

    await deleteImage(imagePath);

    logger.info(`Image deleted: ${imagePath} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upload statistics
 * GET /api/admin/uploads/stats
 */
export const getUploadStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const uploadsDir = 'uploads';

    // Get directory size and file count recursively
    const getDirectoryStats = async (dir: string): Promise<{ size: number; count: number }> => {
      let totalSize = 0;
      let fileCount = 0;

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            const subStats = await getDirectoryStats(fullPath);
            totalSize += subStats.size;
            fileCount += subStats.count;
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          }
        }
      } catch (error) {
        logger.error(`Error reading directory ${dir}:`, error);
      }

      return { size: totalSize, count: fileCount };
    };

    const stats = await getDirectoryStats(uploadsDir);

    // Convert bytes to MB
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Get breakdown by category
    const categories = ['products', 'subproducts', 'composites', 'pdfs', 'settings'];
    const categoryStats: Record<string, any> = {};

    for (const category of categories) {
      const categoryPath = path.join(uploadsDir, category);
      try {
        const catStats = await getDirectoryStats(categoryPath);
        categoryStats[category] = {
          files: catStats.count,
          size: (catStats.size / (1024 * 1024)).toFixed(2) + ' MB'
        };
      } catch (error) {
        categoryStats[category] = { files: 0, size: '0 MB' };
      }
    }

    sendSuccess(res, {
      totalFiles: stats.count,
      totalSize: sizeInMB + ' MB',
      categories: categoryStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cleanup orphaned files (files not referenced in database)
 * POST /api/admin/uploads/cleanup
 */
export const cleanupOrphanedFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This is a complex operation that should:
    // 1. Get all image paths from database (products, subproducts, settings, etc.)
    // 2. Scan uploads directory for all files
    // 3. Compare and delete files not in database
    // 4. Return list of deleted files

    // For now, return a placeholder response
    // TODO: Implement full cleanup logic

    logger.info(`Orphaned files cleanup requested by ${req.user?.email}`);

    sendSuccess(res, {
      message: 'Cleanup functionality not yet implemented',
      note: 'This feature will scan and remove files not referenced in the database'
    });
  } catch (error) {
    next(error);
  }
};

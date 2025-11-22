import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IImage } from '../types';
import logger from '../config/logger';

interface ProcessedImage {
  path: string;
  thumbPath: string;
  width: number;
  height: number;
}

/**
 * Process uploaded image - create optimized web version and thumbnail
 */
export const processImage = async (
  filePath: string,
  outputDir: string
): Promise<ProcessedImage> => {
  try {
    const filename = path.basename(filePath);
    const ext = path.extname(filename);
    const nameWithoutExt = filename.replace(ext, '');

    // Generate output paths
    const webPath = path.join(outputDir, `${nameWithoutExt}-web.webp`);
    const thumbPath = path.join(outputDir, `${nameWithoutExt}-thumb.webp`);

    // Get original image metadata
    const metadata = await sharp(filePath).metadata();

    // Create optimized web version (max 1200x1200)
    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(webPath);

    // Create thumbnail (400x400)
    await sharp(filePath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // Delete original file
    await fs.unlink(filePath);

    logger.info(`Image processed: ${filename}`);

    return {
      path: webPath,
      thumbPath,
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    logger.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Process multiple images
 */
export const processImages = async (
  files: Express.Multer.File[],
  outputDir: string
): Promise<IImage[]> => {
  const processed: IImage[] = [];

  for (const file of files) {
    try {
      const result = await processImage(file.path, outputDir);
      processed.push(result);
    } catch (error) {
      logger.error(`Failed to process ${file.filename}:`, error);
    }
  }

  return processed;
};

/**
 * Delete image files
 */
export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    const dir = path.dirname(imagePath);
    const filename = path.basename(imagePath);
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try to delete both web and thumb versions
    const possiblePaths = [
      imagePath,
      path.join(dir, `${nameWithoutExt}-web.webp`),
      path.join(dir, `${nameWithoutExt}-thumb.webp`)
    ];

    for (const p of possiblePaths) {
      try {
        await fs.unlink(p);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }

    logger.info(`Image deleted: ${imagePath}`);
  } catch (error) {
    logger.error('Image deletion error:', error);
  }
};

/**
 * Composite images together (for configurable products)
 */
export const compositeImages = async (
  imagePaths: string[],
  outputPath: string,
  layout: 'horizontal' | 'vertical' | 'overlay' = 'horizontal'
): Promise<string> => {
  try {
    const images = await Promise.all(
      imagePaths.map(async (imgPath) => ({
        buffer: await sharp(imgPath).toBuffer(),
        metadata: await sharp(imgPath).metadata()
      }))
    );

    let composite;

    if (layout === 'overlay') {
      // Overlay images on top of each other
      const base = images[0];
      const overlays = images.slice(1).map((img) => ({
        input: img.buffer,
        gravity: 'center' as const
      }));

      composite = sharp(base.buffer).composite(overlays);
    } else if (layout === 'horizontal') {
      // Arrange horizontally
      const maxHeight = Math.max(...images.map((img) => img.metadata.height || 0));
      const totalWidth = images.reduce((sum, img) => sum + (img.metadata.width || 0), 0);

      // Create blank canvas
      const canvas = sharp({
        create: {
          width: totalWidth,
          height: maxHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      });

      let xOffset = 0;
      const composites = images.map((img) => {
        const composite = {
          input: img.buffer,
          left: xOffset,
          top: Math.floor((maxHeight - (img.metadata.height || 0)) / 2)
        };
        xOffset += img.metadata.width || 0;
        return composite;
      });

      composite = canvas.composite(composites);
    } else {
      // Vertical layout
      const maxWidth = Math.max(...images.map((img) => img.metadata.width || 0));
      const totalHeight = images.reduce((sum, img) => sum + (img.metadata.height || 0), 0);

      const canvas = sharp({
        create: {
          width: maxWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      });

      let yOffset = 0;
      const composites = images.map((img) => {
        const composite = {
          input: img.buffer,
          left: Math.floor((maxWidth - (img.metadata.width || 0)) / 2),
          top: yOffset
        };
        yOffset += img.metadata.height || 0;
        return composite;
      });

      composite = canvas.composite(composites);
    }

    await composite
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    logger.info(`Composite image created: ${outputPath}`);

    return outputPath;
  } catch (error) {
    logger.error('Composite image creation error:', error);
    throw new Error('Failed to create composite image');
  }
};

import { Request, Response, NextFunction } from 'express';
import { SubProduct } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logDelete, logStockAdjustment } from '../services/auditService';
import { processImages, deleteImage } from '../services/imageService';
import logger from '../config/logger';
import path from 'path';

/**
 * Get all subproducts with pagination and filtering
 * GET /api/admin/subproducts
 */
export const getSubProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;
    const search = req.query.search as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { 'title.ar': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (lowStock) {
      filter.stock = { $lte: 10 }; // Consider low stock as 10 or less
    }

    const [subProducts, total] = await Promise.all([
      SubProduct.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      SubProduct.countDocuments(filter)
    ]);

    sendPaginated(res, subProducts, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get subproduct by ID
 * GET /api/admin/subproducts/:id
 */
export const getSubProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    sendSuccess(res, subProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new subproduct
 * POST /api/admin/subproducts
 */
export const createSubProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, sku, extraPrice, stock, metadata } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingSubProduct = await SubProduct.findOne({ sku });
      if (existingSubProduct) {
        sendError(res, 'SKU already exists', 400, 'SKU_EXISTS');
        return;
      }
    }

    const subProduct = new SubProduct({
      title,
      sku,
      images: [], // Images will be added separately
      extraPrice: extraPrice || 0,
      stock: stock || 0,
      metadata
    });

    await subProduct.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'subproduct', subProduct._id.toString(), {
        title: subProduct.title.ar,
        sku: subProduct.sku
      });
    }

    logger.info(`SubProduct created: ${subProduct.title.ar} by ${req.user?.email}`);

    sendSuccess(res, subProduct, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update subproduct
 * PUT /api/admin/subproducts/:id
 */
export const updateSubProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, sku, extraPrice, stock, metadata } = req.body;

    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    // Check if SKU is being changed and if it already exists
    if (sku && sku !== subProduct.sku) {
      const existingSubProduct = await SubProduct.findOne({ sku });
      if (existingSubProduct) {
        sendError(res, 'SKU already exists', 400, 'SKU_EXISTS');
        return;
      }
      subProduct.sku = sku;
    }

    // Update fields
    if (title) subProduct.title = title;
    if (extraPrice !== undefined) subProduct.extraPrice = extraPrice;
    if (metadata !== undefined) subProduct.metadata = metadata;

    // Handle stock update separately for audit logging
    if (stock !== undefined && stock !== subProduct.stock) {
      const oldStock = subProduct.stock;
      subProduct.stock = stock;

      // Log stock adjustment
      if (req.user) {
        await logStockAdjustment(
          req.user.userId,
          'subproduct',
          subProduct._id.toString(),
          oldStock,
          stock,
          'Manual adjustment via update'
        );
      }
    }

    await subProduct.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'subproduct', subProduct._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`SubProduct updated: ${subProduct.title.ar} by ${req.user?.email}`);

    sendSuccess(res, subProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete subproduct
 * DELETE /api/admin/subproducts/:id
 */
export const deleteSubProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    // Check if subproduct is used in any product configurations
    const { Product } = await import('../models');
    const productsUsingSubProduct = await Product.find({
      isSpecial: true,
      'specialConfig.components.subProductIds': subProduct._id
    });

    if (productsUsingSubProduct.length > 0) {
      sendError(
        res,
        'Cannot delete subproduct that is used in product configurations',
        400,
        'SUBPRODUCT_IN_USE'
      );
      return;
    }

    // Delete associated images
    for (const image of subProduct.images) {
      await deleteImage(image.path);
    }

    await subProduct.deleteOne();

    // Log deletion
    if (req.user) {
      await logDelete(req.user.userId, 'subproduct', subProduct._id.toString(), {
        title: subProduct.title.ar
      });
    }

    logger.info(`SubProduct deleted: ${subProduct.title.ar} by ${req.user?.email}`);

    sendSuccess(res, { message: 'SubProduct deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload images for subproduct
 * POST /api/admin/subproducts/:id/images
 */
export const uploadSubProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      sendError(res, 'No files uploaded', 400, 'NO_FILES');
      return;
    }

    const files = req.files as Express.Multer.File[];
    const outputDir = path.join('uploads', 'subproducts', subProduct._id.toString());

    // Process images
    const processedImages = await processImages(files, outputDir);

    // Add to subproduct
    subProduct.images.push(...processedImages);
    await subProduct.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'subproduct', subProduct._id.toString(), {
        action: 'images_uploaded',
        count: processedImages.length
      });
    }

    logger.info(`Images uploaded for SubProduct: ${subProduct.title.ar}`);

    sendSuccess(res, subProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image from subproduct
 * DELETE /api/admin/subproducts/:id/images/:imageIndex
 */
export const deleteSubProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageIndex = parseInt(req.params.imageIndex);

    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    if (imageIndex < 0 || imageIndex >= subProduct.images.length) {
      sendError(res, 'Invalid image index', 400, 'INVALID_INDEX');
      return;
    }

    const image = subProduct.images[imageIndex];

    // Delete image files
    await deleteImage(image.path);

    // Remove from array
    subProduct.images.splice(imageIndex, 1);
    await subProduct.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'subproduct', subProduct._id.toString(), {
        action: 'image_deleted',
        imageIndex
      });
    }

    logger.info(`Image deleted from SubProduct: ${subProduct.title.ar}`);

    sendSuccess(res, subProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust stock
 * PUT /api/admin/subproducts/:id/stock
 */
export const adjustStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adjustment, reason } = req.body;

    const subProduct = await SubProduct.findById(req.params.id);

    if (!subProduct) {
      sendError(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
      return;
    }

    const oldStock = subProduct.stock;
    const newStock = oldStock + adjustment;

    if (newStock < 0) {
      sendError(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
      return;
    }

    subProduct.stock = newStock;
    await subProduct.save();

    // Log stock adjustment
    if (req.user) {
      await logStockAdjustment(
        req.user.userId,
        'subproduct',
        subProduct._id.toString(),
        oldStock,
        newStock,
        reason
      );
    }

    // Also create inventory log entry
    const { InventoryLog } = await import('../models');
    await InventoryLog.create({
      subProductId: subProduct._id,
      adjustmentType: 'manual',
      quantity: adjustment,
      previousStock: oldStock,
      newStock,
      reason,
      performedBy: req.user?.userId
    });

    logger.info(
      `Stock adjusted for SubProduct ${subProduct.title.ar}: ${oldStock} -> ${newStock}`
    );

    sendSuccess(res, subProduct);
  } catch (error) {
    next(error);
  }
};

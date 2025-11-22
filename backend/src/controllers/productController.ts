import { Request, Response, NextFunction } from 'express';
import { Product, SubProduct } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logDelete, logStockAdjustment } from '../services/auditService';
import { processImages, deleteImage } from '../services/imageService';
import { queueCompositeGeneration, getJobStatus } from '../services/queueService';
import logger from '../config/logger';
import path from 'path';
import { StockPolicy } from '../types';

/**
 * Get all products with pagination and filtering
 * GET /api/admin/products
 */
export const getProducts = async (
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
    const categoryId = req.query.categoryId as string | undefined;
    const isSpecial = req.query.isSpecial as string | undefined;
    const isActive = req.query.isActive as string | undefined;
    const isFeatured = req.query.isFeatured as string | undefined;

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
    if (categoryId) filter.categories = categoryId;
    if (isSpecial !== undefined) filter.isSpecial = isSpecial === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categories', 'name')
        .populate('createdBy', 'name email')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    sendPaginated(res, products, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/admin/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categories', 'name')
      .populate('createdBy', 'name email')
      .populate('specialConfig.components.subProductIds');

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 * POST /api/admin/products
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      sku,
      variants,
      price,
      cost,
      categories,
      isSpecial,
      specialConfig,
      stockPolicy,
      stock,
      isActive,
      isFeatured,
      meta
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      sendError(res, 'SKU already exists', 400, 'SKU_EXISTS');
      return;
    }

    // Validate special product configuration
    if (isSpecial && specialConfig) {
      const validationError = await validateSpecialConfig(specialConfig);
      if (validationError) {
        sendError(res, validationError, 400, 'INVALID_CONFIG');
        return;
      }
    }

    const product = new Product({
      title,
      description,
      sku,
      images: [], // Images will be added separately
      variants,
      price,
      cost,
      categories,
      isSpecial: isSpecial || false,
      specialConfig,
      stockPolicy: stockPolicy || StockPolicy.BY_PRODUCT,
      stock: stock || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      meta,
      createdBy: req.user?.userId
    });

    await product.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'product', product._id.toString(), {
        title: product.title.ar,
        sku: product.sku,
        isSpecial: product.isSpecial
      });
    }

    logger.info(`Product created: ${product.title.ar} by ${req.user?.email}`);

    sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * PUT /api/admin/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      sku,
      variants,
      price,
      cost,
      categories,
      isSpecial,
      specialConfig,
      stockPolicy,
      stock,
      isActive,
      isFeatured,
      meta
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    // Check if SKU is being changed and if it already exists
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        sendError(res, 'SKU already exists', 400, 'SKU_EXISTS');
        return;
      }
      product.sku = sku;
    }

    // Validate special configuration if updating
    if (specialConfig) {
      const validationError = await validateSpecialConfig(specialConfig);
      if (validationError) {
        sendError(res, validationError, 400, 'INVALID_CONFIG');
        return;
      }
    }

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (variants !== undefined) product.variants = variants;
    if (price) product.price = price;
    if (cost !== undefined) product.cost = cost;
    if (categories) product.categories = categories;
    if (isSpecial !== undefined) product.isSpecial = isSpecial;
    if (specialConfig !== undefined) product.specialConfig = specialConfig;
    if (stockPolicy) product.stockPolicy = stockPolicy;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (meta !== undefined) product.meta = meta;

    // Handle stock update separately for audit logging
    if (stock !== undefined && stock !== product.stock) {
      const oldStock = product.stock || 0;
      product.stock = stock;

      // Log stock adjustment
      if (req.user) {
        await logStockAdjustment(
          req.user.userId,
          'product',
          product._id.toString(),
          oldStock,
          stock,
          'Manual adjustment via update'
        );
      }
    }

    await product.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'product', product._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`Product updated: ${product.title.ar} by ${req.user?.email}`);

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    // Check if product is used in any orders
    const { Order } = await import('../models');
    const ordersCount = await Order.countDocuments({
      'lines.productId': product._id
    });

    if (ordersCount > 0) {
      sendError(
        res,
        'Cannot delete product that has been ordered. Consider deactivating it instead.',
        400,
        'PRODUCT_IN_ORDERS'
      );
      return;
    }

    // Delete associated images
    for (const image of product.images) {
      await deleteImage(image.path);
    }

    // Delete composite images if special product
    if (product.isSpecial && product.specialConfig?.combinationImages) {
      for (const combo of product.specialConfig.combinationImages) {
        await deleteImage(combo.imagePath);
      }
    }

    await product.deleteOne();

    // Log deletion
    if (req.user) {
      await logDelete(req.user.userId, 'product', product._id.toString(), {
        title: product.title.ar
      });
    }

    logger.info(`Product deleted: ${product.title.ar} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload images for product
 * POST /api/admin/products/:id/images
 */
export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      sendError(res, 'No files uploaded', 400, 'NO_FILES');
      return;
    }

    const files = req.files as Express.Multer.File[];
    const outputDir = path.join('uploads', 'products', product._id.toString());

    // Process images
    const processedImages = await processImages(files, outputDir);

    // Add to product
    product.images.push(...processedImages);
    await product.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'product', product._id.toString(), {
        action: 'images_uploaded',
        count: processedImages.length
      });
    }

    logger.info(`Images uploaded for Product: ${product.title.ar}`);

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image from product
 * DELETE /api/admin/products/:id/images/:imageIndex
 */
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageIndex = parseInt(req.params.imageIndex);

    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    if (imageIndex < 0 || imageIndex >= product.images.length) {
      sendError(res, 'Invalid image index', 400, 'INVALID_INDEX');
      return;
    }

    const image = product.images[imageIndex];

    // Delete image files
    await deleteImage(image.path);

    // Remove from array
    product.images.splice(imageIndex, 1);
    await product.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'product', product._id.toString(), {
        action: 'image_deleted',
        imageIndex
      });
    }

    logger.info(`Image deleted from Product: ${product.title.ar}`);

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate composite image for special product
 * POST /api/admin/products/:id/generate-composite
 */
export const generateComposite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mapping } = req.body; // { componentKey: subProductId }

    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    if (!product.isSpecial || !product.specialConfig) {
      sendError(res, 'Product is not a special product', 400, 'NOT_SPECIAL_PRODUCT');
      return;
    }

    // Validate mapping
    const componentKeys = product.specialConfig.components.map(c => c.componentKey);
    for (const key of componentKeys) {
      if (!mapping[key]) {
        sendError(res, `Missing component selection for: ${key}`, 400, 'INVALID_MAPPING');
        return;
      }
    }

    // Queue composite generation job
    const job = await queueCompositeGeneration(product._id.toString(), mapping);

    logger.info(`Composite generation job queued: ${job.id} for product ${product.title.ar}`);

    sendSuccess(res, {
      message: 'Composite generation job queued',
      jobId: job.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get composite generation job status
 * GET /api/admin/products/composite-job/:jobId
 */
export const getCompositeJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobStatus = await getJobStatus(req.params.jobId);

    if (!jobStatus) {
      sendError(res, 'Job not found', 404, 'JOB_NOT_FOUND');
      return;
    }

    sendSuccess(res, jobStatus);
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust stock
 * PUT /api/admin/products/:id/stock
 */
export const adjustStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adjustment, reason, variantId } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
      return;
    }

    if (product.stockPolicy === StockPolicy.BY_COMPONENT) {
      sendError(
        res,
        'Stock is managed by components for this product',
        400,
        'STOCK_BY_COMPONENT'
      );
      return;
    }

    if (product.stockPolicy === StockPolicy.BY_VARIANT) {
      if (!variantId) {
        sendError(res, 'Variant ID is required for this product', 400, 'VARIANT_REQUIRED');
        return;
      }

      const variant = product.variants?.find(v => v.sku === variantId);
      if (!variant) {
        sendError(res, 'Variant not found', 404, 'VARIANT_NOT_FOUND');
        return;
      }

      const oldStock = variant.stock;
      const newStock = oldStock + adjustment;

      if (newStock < 0) {
        sendError(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
        return;
      }

      variant.stock = newStock;

      // Log stock adjustment
      if (req.user) {
        await logStockAdjustment(
          req.user.userId,
          'product',
          product._id.toString(),
          oldStock,
          newStock,
          reason
        );
      }

      // Create inventory log
      const { InventoryLog } = await import('../models');
      await InventoryLog.create({
        productId: product._id,
        variantId,
        adjustmentType: 'manual',
        quantity: adjustment,
        previousStock: oldStock,
        newStock,
        reason,
        performedBy: req.user?.userId
      });
    } else {
      // BY_PRODUCT
      const oldStock = product.stock || 0;
      const newStock = oldStock + adjustment;

      if (newStock < 0) {
        sendError(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
        return;
      }

      product.stock = newStock;

      // Log stock adjustment
      if (req.user) {
        await logStockAdjustment(
          req.user.userId,
          'product',
          product._id.toString(),
          oldStock,
          newStock,
          reason
        );
      }

      // Create inventory log
      const { InventoryLog } = await import('../models');
      await InventoryLog.create({
        productId: product._id,
        adjustmentType: 'manual',
        quantity: adjustment,
        previousStock: oldStock,
        newStock,
        reason,
        performedBy: req.user?.userId
      });
    }

    await product.save();

    logger.info(`Stock adjusted for Product: ${product.title.ar}`);

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to validate special product configuration
 */
async function validateSpecialConfig(specialConfig: any): Promise<string | null> {
  if (!specialConfig.components || !Array.isArray(specialConfig.components)) {
    return 'Components array is required for special products';
  }

  if (specialConfig.components.length === 0) {
    return 'At least one component group is required';
  }

  // Validate each component group
  for (const component of specialConfig.components) {
    if (!component.componentKey || !component.label || !component.subProductIds) {
      return 'Each component must have componentKey, label, and subProductIds';
    }

    if (!Array.isArray(component.subProductIds) || component.subProductIds.length === 0) {
      return `Component ${component.componentKey} must have at least one subproduct`;
    }

    // Verify all subproducts exist
    const subProducts = await SubProduct.find({
      _id: { $in: component.subProductIds }
    });

    if (subProducts.length !== component.subProductIds.length) {
      return `Some subproducts in component ${component.componentKey} do not exist`;
    }
  }

  return null;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.getCompositeJobStatus = exports.generateComposite = exports.deleteProductImage = exports.uploadProductImages = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const imageService_1 = require("../services/imageService");
const queueService_1 = require("../services/queueService");
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../types");
/**
 * Get all products with pagination and filtering
 * GET /api/admin/products
 */
const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const search = req.query.search;
        const categoryId = req.query.categoryId;
        const isSpecial = req.query.isSpecial;
        const isActive = req.query.isActive;
        const isFeatured = req.query.isFeatured;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (search) {
            filter.$or = [
                { 'title.ar': { $regex: search, $options: 'i' } },
                { 'title.en': { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }
        if (categoryId)
            filter.categories = categoryId;
        if (isSpecial !== undefined)
            filter.isSpecial = isSpecial === 'true';
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        if (isFeatured !== undefined)
            filter.isFeatured = isFeatured === 'true';
        const [products, total] = await Promise.all([
            models_1.Product.find(filter)
                .populate('categories', 'name')
                .populate('createdBy', 'name email')
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.Product.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, products, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
/**
 * Get product by ID
 * GET /api/admin/products/:id
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await models_1.Product.findById(req.params.id)
            .populate('categories', 'name')
            .populate('createdBy', 'name email')
            .populate('specialConfig.components.subProductIds');
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
/**
 * Create new product
 * POST /api/admin/products
 */
const createProduct = async (req, res, next) => {
    try {
        const { title, description, sku, variants, price, cost, categories, isSpecial, specialConfig, stockPolicy, stock, isActive, isFeatured, meta } = req.body;
        // Check if SKU already exists
        const existingProduct = await models_1.Product.findOne({ sku });
        if (existingProduct) {
            (0, apiResponse_1.sendError)(res, 'SKU already exists', 400, 'SKU_EXISTS');
            return;
        }
        // Validate special product configuration
        if (isSpecial && specialConfig) {
            const validationError = await validateSpecialConfig(specialConfig);
            if (validationError) {
                (0, apiResponse_1.sendError)(res, validationError, 400, 'INVALID_CONFIG');
                return;
            }
        }
        const product = new models_1.Product({
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
            stockPolicy: stockPolicy || types_1.StockPolicy.BY_PRODUCT,
            stock: stock || 0,
            isActive: isActive !== undefined ? isActive : true,
            isFeatured: isFeatured || false,
            meta,
            createdBy: req.user?.userId
        });
        await product.save();
        // Log creation
        if (req.user) {
            await (0, auditService_1.logCreate)(req.user.userId, 'product', product._id.toString(), {
                title: product.title.ar,
                sku: product.sku,
                isSpecial: product.isSpecial
            });
        }
        logger_1.default.info(`Product created: ${product.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, product, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
/**
 * Update product
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
    try {
        const { title, description, sku, variants, price, cost, categories, isSpecial, specialConfig, stockPolicy, stock, isActive, isFeatured, meta } = req.body;
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        // Check if SKU is being changed and if it already exists
        if (sku && sku !== product.sku) {
            const existingProduct = await models_1.Product.findOne({ sku });
            if (existingProduct) {
                (0, apiResponse_1.sendError)(res, 'SKU already exists', 400, 'SKU_EXISTS');
                return;
            }
            product.sku = sku;
        }
        // Validate special configuration if updating
        if (specialConfig) {
            const validationError = await validateSpecialConfig(specialConfig);
            if (validationError) {
                (0, apiResponse_1.sendError)(res, validationError, 400, 'INVALID_CONFIG');
                return;
            }
        }
        // Update fields
        if (title)
            product.title = title;
        if (description)
            product.description = description;
        if (variants !== undefined)
            product.variants = variants;
        if (price)
            product.price = price;
        if (cost !== undefined)
            product.cost = cost;
        if (categories)
            product.categories = categories;
        if (isSpecial !== undefined)
            product.isSpecial = isSpecial;
        if (specialConfig !== undefined)
            product.specialConfig = specialConfig;
        if (stockPolicy)
            product.stockPolicy = stockPolicy;
        if (isActive !== undefined)
            product.isActive = isActive;
        if (isFeatured !== undefined)
            product.isFeatured = isFeatured;
        if (meta !== undefined)
            product.meta = meta;
        // Handle stock update separately for audit logging
        if (stock !== undefined && stock !== product.stock) {
            const oldStock = product.stock || 0;
            product.stock = stock;
            // Log stock adjustment
            if (req.user) {
                await (0, auditService_1.logStockAdjustment)(req.user.userId, 'product', product._id.toString(), oldStock, stock, 'Manual adjustment via update');
            }
        }
        await product.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'product', product._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`Product updated: ${product.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        // Check if product is used in any orders
        const { Order } = await Promise.resolve().then(() => __importStar(require('../models')));
        const ordersCount = await Order.countDocuments({
            'lines.productId': product._id
        });
        if (ordersCount > 0) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete product that has been ordered. Consider deactivating it instead.', 400, 'PRODUCT_IN_ORDERS');
            return;
        }
        // Delete associated images
        for (const image of product.images) {
            await (0, imageService_1.deleteImage)(image.path);
        }
        // Delete composite images if special product
        if (product.isSpecial && product.specialConfig?.combinationImages) {
            for (const combo of product.specialConfig.combinationImages) {
                await (0, imageService_1.deleteImage)(combo.imagePath);
            }
        }
        await product.deleteOne();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logDelete)(req.user.userId, 'product', product._id.toString(), {
                title: product.title.ar
            });
        }
        logger_1.default.info(`Product deleted: ${product.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
/**
 * Upload images for product
 * POST /api/admin/products/:id/images
 */
const uploadProductImages = async (req, res, next) => {
    try {
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        if (!req.files || req.files.length === 0) {
            (0, apiResponse_1.sendError)(res, 'No files uploaded', 400, 'NO_FILES');
            return;
        }
        const files = req.files;
        const outputDir = path_1.default.join('uploads', 'products', product._id.toString());
        // Process images
        const processedImages = await (0, imageService_1.processImages)(files, outputDir);
        // Add to product
        product.images.push(...processedImages);
        await product.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'product', product._id.toString(), {
                action: 'images_uploaded',
                count: processedImages.length
            });
        }
        logger_1.default.info(`Images uploaded for Product: ${product.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadProductImages = uploadProductImages;
/**
 * Delete image from product
 * DELETE /api/admin/products/:id/images/:imageIndex
 */
const deleteProductImage = async (req, res, next) => {
    try {
        const imageIndex = parseInt(req.params.imageIndex);
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        if (imageIndex < 0 || imageIndex >= product.images.length) {
            (0, apiResponse_1.sendError)(res, 'Invalid image index', 400, 'INVALID_INDEX');
            return;
        }
        const image = product.images[imageIndex];
        // Delete image files
        await (0, imageService_1.deleteImage)(image.path);
        // Remove from array
        product.images.splice(imageIndex, 1);
        await product.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'product', product._id.toString(), {
                action: 'image_deleted',
                imageIndex
            });
        }
        logger_1.default.info(`Image deleted from Product: ${product.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProductImage = deleteProductImage;
/**
 * Generate composite image for special product
 * POST /api/admin/products/:id/generate-composite
 */
const generateComposite = async (req, res, next) => {
    try {
        const { mapping } = req.body; // { componentKey: subProductId }
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        if (!product.isSpecial || !product.specialConfig) {
            (0, apiResponse_1.sendError)(res, 'Product is not a special product', 400, 'NOT_SPECIAL_PRODUCT');
            return;
        }
        // Validate mapping
        const componentKeys = product.specialConfig.components.map(c => c.componentKey);
        for (const key of componentKeys) {
            if (!mapping[key]) {
                (0, apiResponse_1.sendError)(res, `Missing component selection for: ${key}`, 400, 'INVALID_MAPPING');
                return;
            }
        }
        // Queue composite generation job
        const job = await (0, queueService_1.queueCompositeGeneration)(product._id.toString(), mapping);
        logger_1.default.info(`Composite generation job queued: ${job.id} for product ${product.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, {
            message: 'Composite generation job queued',
            jobId: job.id
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateComposite = generateComposite;
/**
 * Get composite generation job status
 * GET /api/admin/products/composite-job/:jobId
 */
const getCompositeJobStatus = async (req, res, next) => {
    try {
        const jobStatus = await (0, queueService_1.getJobStatus)(req.params.jobId);
        if (!jobStatus) {
            (0, apiResponse_1.sendError)(res, 'Job not found', 404, 'JOB_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, jobStatus);
    }
    catch (error) {
        next(error);
    }
};
exports.getCompositeJobStatus = getCompositeJobStatus;
/**
 * Adjust stock
 * PUT /api/admin/products/:id/stock
 */
const adjustStock = async (req, res, next) => {
    try {
        const { adjustment, reason, variantId } = req.body;
        const product = await models_1.Product.findById(req.params.id);
        if (!product) {
            (0, apiResponse_1.sendError)(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
            return;
        }
        if (product.stockPolicy === types_1.StockPolicy.BY_COMPONENT) {
            (0, apiResponse_1.sendError)(res, 'Stock is managed by components for this product', 400, 'STOCK_BY_COMPONENT');
            return;
        }
        if (product.stockPolicy === types_1.StockPolicy.BY_VARIANT) {
            if (!variantId) {
                (0, apiResponse_1.sendError)(res, 'Variant ID is required for this product', 400, 'VARIANT_REQUIRED');
                return;
            }
            const variant = product.variants?.find(v => v.sku === variantId);
            if (!variant) {
                (0, apiResponse_1.sendError)(res, 'Variant not found', 404, 'VARIANT_NOT_FOUND');
                return;
            }
            const oldStock = variant.stock;
            const newStock = oldStock + adjustment;
            if (newStock < 0) {
                (0, apiResponse_1.sendError)(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
                return;
            }
            variant.stock = newStock;
            // Log stock adjustment
            if (req.user) {
                await (0, auditService_1.logStockAdjustment)(req.user.userId, 'product', product._id.toString(), oldStock, newStock, reason);
            }
            // Create inventory log
            const { InventoryLog } = await Promise.resolve().then(() => __importStar(require('../models')));
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
        }
        else {
            // BY_PRODUCT
            const oldStock = product.stock || 0;
            const newStock = oldStock + adjustment;
            if (newStock < 0) {
                (0, apiResponse_1.sendError)(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
                return;
            }
            product.stock = newStock;
            // Log stock adjustment
            if (req.user) {
                await (0, auditService_1.logStockAdjustment)(req.user.userId, 'product', product._id.toString(), oldStock, newStock, reason);
            }
            // Create inventory log
            const { InventoryLog } = await Promise.resolve().then(() => __importStar(require('../models')));
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
        logger_1.default.info(`Stock adjusted for Product: ${product.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
};
exports.adjustStock = adjustStock;
/**
 * Helper function to validate special product configuration
 */
async function validateSpecialConfig(specialConfig) {
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
        const subProducts = await models_1.SubProduct.find({
            _id: { $in: component.subProductIds }
        });
        if (subProducts.length !== component.subProductIds.length) {
            return `Some subproducts in component ${component.componentKey} do not exist`;
        }
    }
    return null;
}
//# sourceMappingURL=productController.js.map
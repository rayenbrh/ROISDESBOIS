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
exports.adjustStock = exports.deleteSubProductImage = exports.uploadSubProductImages = exports.deleteSubProduct = exports.updateSubProduct = exports.createSubProduct = exports.getSubProductById = exports.getSubProducts = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const imageService_1 = require("../services/imageService");
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
/**
 * Get all subproducts with pagination and filtering
 * GET /api/admin/subproducts
 */
const getSubProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const search = req.query.search;
        const lowStock = req.query.lowStock === 'true';
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
        if (lowStock) {
            filter.stock = { $lte: 10 }; // Consider low stock as 10 or less
        }
        const [subProducts, total] = await Promise.all([
            models_1.SubProduct.find(filter)
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.SubProduct.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, subProducts, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubProducts = getSubProducts;
/**
 * Get subproduct by ID
 * GET /api/admin/subproducts/:id
 */
const getSubProductById = async (req, res, next) => {
    try {
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, subProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.getSubProductById = getSubProductById;
/**
 * Create new subproduct
 * POST /api/admin/subproducts
 */
const createSubProduct = async (req, res, next) => {
    try {
        const { title, sku, extraPrice, stock, metadata } = req.body;
        // Check if SKU already exists
        if (sku) {
            const existingSubProduct = await models_1.SubProduct.findOne({ sku });
            if (existingSubProduct) {
                (0, apiResponse_1.sendError)(res, 'SKU already exists', 400, 'SKU_EXISTS');
                return;
            }
        }
        const subProduct = new models_1.SubProduct({
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
            await (0, auditService_1.logCreate)(req.user.userId, 'subproduct', subProduct._id.toString(), {
                title: subProduct.title.ar,
                sku: subProduct.sku
            });
        }
        logger_1.default.info(`SubProduct created: ${subProduct.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, subProduct, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createSubProduct = createSubProduct;
/**
 * Update subproduct
 * PUT /api/admin/subproducts/:id
 */
const updateSubProduct = async (req, res, next) => {
    try {
        const { title, sku, extraPrice, stock, metadata } = req.body;
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        // Check if SKU is being changed and if it already exists
        if (sku && sku !== subProduct.sku) {
            const existingSubProduct = await models_1.SubProduct.findOne({ sku });
            if (existingSubProduct) {
                (0, apiResponse_1.sendError)(res, 'SKU already exists', 400, 'SKU_EXISTS');
                return;
            }
            subProduct.sku = sku;
        }
        // Update fields
        if (title)
            subProduct.title = title;
        if (extraPrice !== undefined)
            subProduct.extraPrice = extraPrice;
        if (metadata !== undefined)
            subProduct.metadata = metadata;
        // Handle stock update separately for audit logging
        if (stock !== undefined && stock !== subProduct.stock) {
            const oldStock = subProduct.stock;
            subProduct.stock = stock;
            // Log stock adjustment
            if (req.user) {
                await (0, auditService_1.logStockAdjustment)(req.user.userId, 'subproduct', subProduct._id.toString(), oldStock, stock, 'Manual adjustment via update');
            }
        }
        await subProduct.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'subproduct', subProduct._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`SubProduct updated: ${subProduct.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, subProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubProduct = updateSubProduct;
/**
 * Delete subproduct
 * DELETE /api/admin/subproducts/:id
 */
const deleteSubProduct = async (req, res, next) => {
    try {
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        // Check if subproduct is used in any product configurations
        const { Product } = await Promise.resolve().then(() => __importStar(require('../models')));
        const productsUsingSubProduct = await Product.find({
            isSpecial: true,
            'specialConfig.components.subProductIds': subProduct._id
        });
        if (productsUsingSubProduct.length > 0) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete subproduct that is used in product configurations', 400, 'SUBPRODUCT_IN_USE');
            return;
        }
        // Delete associated images
        for (const image of subProduct.images) {
            await (0, imageService_1.deleteImage)(image.path);
        }
        await subProduct.deleteOne();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logDelete)(req.user.userId, 'subproduct', subProduct._id.toString(), {
                title: subProduct.title.ar
            });
        }
        logger_1.default.info(`SubProduct deleted: ${subProduct.title.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'SubProduct deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubProduct = deleteSubProduct;
/**
 * Upload images for subproduct
 * POST /api/admin/subproducts/:id/images
 */
const uploadSubProductImages = async (req, res, next) => {
    try {
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        if (!req.files || req.files.length === 0) {
            (0, apiResponse_1.sendError)(res, 'No files uploaded', 400, 'NO_FILES');
            return;
        }
        const files = req.files;
        const outputDir = path_1.default.join('uploads', 'subproducts', subProduct._id.toString());
        // Process images
        const processedImages = await (0, imageService_1.processImages)(files, outputDir);
        // Add to subproduct
        subProduct.images.push(...processedImages);
        await subProduct.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'subproduct', subProduct._id.toString(), {
                action: 'images_uploaded',
                count: processedImages.length
            });
        }
        logger_1.default.info(`Images uploaded for SubProduct: ${subProduct.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, subProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadSubProductImages = uploadSubProductImages;
/**
 * Delete image from subproduct
 * DELETE /api/admin/subproducts/:id/images/:imageIndex
 */
const deleteSubProductImage = async (req, res, next) => {
    try {
        const imageIndex = parseInt(req.params.imageIndex);
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        if (imageIndex < 0 || imageIndex >= subProduct.images.length) {
            (0, apiResponse_1.sendError)(res, 'Invalid image index', 400, 'INVALID_INDEX');
            return;
        }
        const image = subProduct.images[imageIndex];
        // Delete image files
        await (0, imageService_1.deleteImage)(image.path);
        // Remove from array
        subProduct.images.splice(imageIndex, 1);
        await subProduct.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'subproduct', subProduct._id.toString(), {
                action: 'image_deleted',
                imageIndex
            });
        }
        logger_1.default.info(`Image deleted from SubProduct: ${subProduct.title.ar}`);
        (0, apiResponse_1.sendSuccess)(res, subProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubProductImage = deleteSubProductImage;
/**
 * Adjust stock
 * PUT /api/admin/subproducts/:id/stock
 */
const adjustStock = async (req, res, next) => {
    try {
        const { adjustment, reason } = req.body;
        const subProduct = await models_1.SubProduct.findById(req.params.id);
        if (!subProduct) {
            (0, apiResponse_1.sendError)(res, 'SubProduct not found', 404, 'SUBPRODUCT_NOT_FOUND');
            return;
        }
        const oldStock = subProduct.stock;
        const newStock = oldStock + adjustment;
        if (newStock < 0) {
            (0, apiResponse_1.sendError)(res, 'Stock cannot be negative', 400, 'INVALID_STOCK');
            return;
        }
        subProduct.stock = newStock;
        await subProduct.save();
        // Log stock adjustment
        if (req.user) {
            await (0, auditService_1.logStockAdjustment)(req.user.userId, 'subproduct', subProduct._id.toString(), oldStock, newStock, reason);
        }
        // Also create inventory log entry
        const { InventoryLog } = await Promise.resolve().then(() => __importStar(require('../models')));
        await InventoryLog.create({
            subProductId: subProduct._id,
            adjustmentType: 'manual',
            quantity: adjustment,
            previousStock: oldStock,
            newStock,
            reason,
            performedBy: req.user?.userId
        });
        logger_1.default.info(`Stock adjusted for SubProduct ${subProduct.title.ar}: ${oldStock} -> ${newStock}`);
        (0, apiResponse_1.sendSuccess)(res, subProduct);
    }
    catch (error) {
        next(error);
    }
};
exports.adjustStock = adjustStock;
//# sourceMappingURL=subProductController.js.map
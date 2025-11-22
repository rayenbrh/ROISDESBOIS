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
exports.cleanupOrphanedFiles = exports.getUploadStats = exports.deleteImageFile = exports.uploadImage = exports.uploadImages = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const imageService_1 = require("../services/imageService");
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Upload images (generic endpoint)
 * POST /api/admin/uploads/images
 */
const uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            (0, apiResponse_1.sendError)(res, 'No files uploaded', 400, 'NO_FILES');
            return;
        }
        const files = req.files;
        const category = req.body.category || 'general'; // products, subproducts, general, etc.
        const outputDir = path_1.default.join('uploads', category);
        // Process images
        const processedImages = await (0, imageService_1.processImages)(files, outputDir);
        logger_1.default.info(`${processedImages.length} images uploaded to ${category} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, processedImages);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImages = uploadImages;
/**
 * Upload single image
 * POST /api/admin/uploads/image
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            (0, apiResponse_1.sendError)(res, 'No file uploaded', 400, 'NO_FILE');
            return;
        }
        const category = req.body.category || 'general';
        const outputDir = path_1.default.join('uploads', category);
        // Process image
        const { processImage } = await Promise.resolve().then(() => __importStar(require('../services/imageService')));
        const processedImage = await processImage(req.file.path, outputDir);
        logger_1.default.info(`Image uploaded to ${category} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, processedImage);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImage = uploadImage;
/**
 * Delete image
 * DELETE /api/admin/uploads/image
 */
const deleteImageFile = async (req, res, next) => {
    try {
        const { imagePath } = req.body;
        if (!imagePath) {
            (0, apiResponse_1.sendError)(res, 'Image path is required', 400, 'NO_PATH');
            return;
        }
        // Security check: ensure path is within uploads directory
        const normalizedPath = path_1.default.normalize(imagePath);
        if (!normalizedPath.startsWith('uploads/')) {
            (0, apiResponse_1.sendError)(res, 'Invalid image path', 400, 'INVALID_PATH');
            return;
        }
        await (0, imageService_1.deleteImage)(imagePath);
        logger_1.default.info(`Image deleted: ${imagePath} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Image deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImageFile = deleteImageFile;
/**
 * Get upload statistics
 * GET /api/admin/uploads/stats
 */
const getUploadStats = async (req, res, next) => {
    try {
        const uploadsDir = 'uploads';
        // Get directory size and file count recursively
        const getDirectoryStats = async (dir) => {
            let totalSize = 0;
            let fileCount = 0;
            try {
                const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        const subStats = await getDirectoryStats(fullPath);
                        totalSize += subStats.size;
                        fileCount += subStats.count;
                    }
                    else if (entry.isFile()) {
                        const stats = await promises_1.default.stat(fullPath);
                        totalSize += stats.size;
                        fileCount++;
                    }
                }
            }
            catch (error) {
                logger_1.default.error(`Error reading directory ${dir}:`, error);
            }
            return { size: totalSize, count: fileCount };
        };
        const stats = await getDirectoryStats(uploadsDir);
        // Convert bytes to MB
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        // Get breakdown by category
        const categories = ['products', 'subproducts', 'composites', 'pdfs', 'settings'];
        const categoryStats = {};
        for (const category of categories) {
            const categoryPath = path_1.default.join(uploadsDir, category);
            try {
                const catStats = await getDirectoryStats(categoryPath);
                categoryStats[category] = {
                    files: catStats.count,
                    size: (catStats.size / (1024 * 1024)).toFixed(2) + ' MB'
                };
            }
            catch (error) {
                categoryStats[category] = { files: 0, size: '0 MB' };
            }
        }
        (0, apiResponse_1.sendSuccess)(res, {
            totalFiles: stats.count,
            totalSize: sizeInMB + ' MB',
            categories: categoryStats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUploadStats = getUploadStats;
/**
 * Cleanup orphaned files (files not referenced in database)
 * POST /api/admin/uploads/cleanup
 */
const cleanupOrphanedFiles = async (req, res, next) => {
    try {
        // This is a complex operation that should:
        // 1. Get all image paths from database (products, subproducts, settings, etc.)
        // 2. Scan uploads directory for all files
        // 3. Compare and delete files not in database
        // 4. Return list of deleted files
        // For now, return a placeholder response
        // TODO: Implement full cleanup logic
        logger_1.default.info(`Orphaned files cleanup requested by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, {
            message: 'Cleanup functionality not yet implemented',
            note: 'This feature will scan and remove files not referenced in the database'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanupOrphanedFiles = cleanupOrphanedFiles;
//# sourceMappingURL=uploadController.js.map
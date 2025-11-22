"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobStatus = exports.queueCompositeGeneration = exports.compositeQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const models_1 = require("../models");
const imageService_1 = require("./imageService");
const logger_1 = __importDefault(require("../config/logger"));
const path_1 = __importDefault(require("path"));
// Create Bull queue for composite image generation
exports.compositeQueue = new bull_1.default('composite-images', {
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
exports.compositeQueue.process(async (job) => {
    const { productId, mapping } = job.data;
    logger_1.default.info(`Processing composite image job for product ${productId}`);
    try {
        // Fetch product
        const product = await models_1.Product.findById(productId);
        if (!product || !product.isSpecial) {
            throw new Error('Product not found or not a special product');
        }
        // Fetch all subproducts in the mapping
        const subProductIds = Object.values(mapping);
        const subProducts = await models_1.SubProduct.find({ _id: { $in: subProductIds } });
        if (subProducts.length !== subProductIds.length) {
            throw new Error('Some subproducts not found');
        }
        // Build image paths array in order of component keys
        const imagePaths = [];
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
        const outputDir = path_1.default.join('uploads', 'composites');
        const outputFilename = `composite-${productId}-${hash}-${timestamp}.webp`;
        const outputPath = path_1.default.join(outputDir, outputFilename);
        // Create composite image
        await (0, imageService_1.compositeImages)(imagePaths, outputPath, 'overlay');
        // Update product's specialConfig with new combination image
        if (!product.specialConfig) {
            product.specialConfig = {
                components: [],
                compositeMode: 'auto',
                combinationImages: []
            };
        }
        if (!product.specialConfig.combinationImages) {
            product.specialConfig.combinationImages = [];
        }
        // Check if this mapping already exists
        const existingIndex = product.specialConfig.combinationImages.findIndex((ci) => JSON.stringify(ci.mapping) === JSON.stringify(mapping));
        if (existingIndex >= 0) {
            // Update existing
            product.specialConfig.combinationImages[existingIndex].imagePath = outputPath;
        }
        else {
            // Add new
            product.specialConfig.combinationImages.push({
                mapping,
                imagePath: outputPath
            });
        }
        await product.save();
        logger_1.default.info(`Composite image generated and saved: ${outputPath}`);
        return {
            success: true,
            imagePath: outputPath,
            productId,
            mapping
        };
    }
    catch (error) {
        logger_1.default.error(`Composite image job failed:`, error);
        throw error;
    }
});
/**
 * Add composite image generation job to queue
 */
const queueCompositeGeneration = async (productId, mapping) => {
    const job = await exports.compositeQueue.add({
        productId,
        mapping
    });
    logger_1.default.info(`Composite image job queued: ${job.id}`);
    return job;
};
exports.queueCompositeGeneration = queueCompositeGeneration;
/**
 * Get job status
 */
const getJobStatus = async (jobId) => {
    const job = await exports.compositeQueue.getJob(jobId);
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
exports.getJobStatus = getJobStatus;
// Queue event listeners
exports.compositeQueue.on('completed', (job, result) => {
    logger_1.default.info(`Job ${job.id} completed:`, result);
});
exports.compositeQueue.on('failed', (job, err) => {
    logger_1.default.error(`Job ${job?.id} failed:`, err.message);
});
exports.compositeQueue.on('error', (error) => {
    logger_1.default.error('Queue error:', error);
});
exports.default = exports.compositeQueue;
//# sourceMappingURL=queueService.js.map
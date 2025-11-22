"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compositeImages = exports.deleteImage = exports.processImages = exports.processImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Process uploaded image - create optimized web version and thumbnail
 */
const processImage = async (filePath, outputDir) => {
    try {
        const filename = path_1.default.basename(filePath);
        const ext = path_1.default.extname(filename);
        const nameWithoutExt = filename.replace(ext, '');
        // Generate output paths
        const webPath = path_1.default.join(outputDir, `${nameWithoutExt}-web.webp`);
        const thumbPath = path_1.default.join(outputDir, `${nameWithoutExt}-thumb.webp`);
        // Get original image metadata
        const metadata = await (0, sharp_1.default)(filePath).metadata();
        // Create optimized web version (max 1200x1200)
        await (0, sharp_1.default)(filePath)
            .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .webp({ quality: 85 })
            .toFile(webPath);
        // Create thumbnail (400x400)
        await (0, sharp_1.default)(filePath)
            .resize(400, 400, {
            fit: 'cover',
            position: 'center'
        })
            .webp({ quality: 80 })
            .toFile(thumbPath);
        // Delete original file
        await promises_1.default.unlink(filePath);
        logger_1.default.info(`Image processed: ${filename}`);
        return {
            path: webPath,
            thumbPath,
            width: metadata.width || 0,
            height: metadata.height || 0
        };
    }
    catch (error) {
        logger_1.default.error('Image processing error:', error);
        throw new Error('Failed to process image');
    }
};
exports.processImage = processImage;
/**
 * Process multiple images
 */
const processImages = async (files, outputDir) => {
    const processed = [];
    for (const file of files) {
        try {
            const result = await (0, exports.processImage)(file.path, outputDir);
            processed.push(result);
        }
        catch (error) {
            logger_1.default.error(`Failed to process ${file.filename}:`, error);
        }
    }
    return processed;
};
exports.processImages = processImages;
/**
 * Delete image files
 */
const deleteImage = async (imagePath) => {
    try {
        const dir = path_1.default.dirname(imagePath);
        const filename = path_1.default.basename(imagePath);
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        // Try to delete both web and thumb versions
        const possiblePaths = [
            imagePath,
            path_1.default.join(dir, `${nameWithoutExt}-web.webp`),
            path_1.default.join(dir, `${nameWithoutExt}-thumb.webp`)
        ];
        for (const p of possiblePaths) {
            try {
                await promises_1.default.unlink(p);
            }
            catch (err) {
                // Ignore if file doesn't exist
            }
        }
        logger_1.default.info(`Image deleted: ${imagePath}`);
    }
    catch (error) {
        logger_1.default.error('Image deletion error:', error);
    }
};
exports.deleteImage = deleteImage;
/**
 * Composite images together (for configurable products)
 */
const compositeImages = async (imagePaths, outputPath, layout = 'horizontal') => {
    try {
        const images = await Promise.all(imagePaths.map(async (imgPath) => ({
            buffer: await (0, sharp_1.default)(imgPath).toBuffer(),
            metadata: await (0, sharp_1.default)(imgPath).metadata()
        })));
        let composite;
        if (layout === 'overlay') {
            // Overlay images on top of each other
            const base = images[0];
            const overlays = images.slice(1).map((img) => ({
                input: img.buffer,
                gravity: 'center'
            }));
            composite = (0, sharp_1.default)(base.buffer).composite(overlays);
        }
        else if (layout === 'horizontal') {
            // Arrange horizontally
            const maxHeight = Math.max(...images.map((img) => img.metadata.height || 0));
            const totalWidth = images.reduce((sum, img) => sum + (img.metadata.width || 0), 0);
            // Create blank canvas
            const canvas = (0, sharp_1.default)({
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
        }
        else {
            // Vertical layout
            const maxWidth = Math.max(...images.map((img) => img.metadata.width || 0));
            const totalHeight = images.reduce((sum, img) => sum + (img.metadata.height || 0), 0);
            const canvas = (0, sharp_1.default)({
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
        logger_1.default.info(`Composite image created: ${outputPath}`);
        return outputPath;
    }
    catch (error) {
        logger_1.default.error('Composite image creation error:', error);
        throw new Error('Failed to create composite image');
    }
};
exports.compositeImages = compositeImages;
//# sourceMappingURL=imageService.js.map
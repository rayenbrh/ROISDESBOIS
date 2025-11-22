import { IImage } from '../types';
interface ProcessedImage {
    path: string;
    thumbPath: string;
    width: number;
    height: number;
}
/**
 * Process uploaded image - create optimized web version and thumbnail
 */
export declare const processImage: (filePath: string, outputDir: string) => Promise<ProcessedImage>;
/**
 * Process multiple images
 */
export declare const processImages: (files: Express.Multer.File[], outputDir: string) => Promise<IImage[]>;
/**
 * Delete image files
 */
export declare const deleteImage: (imagePath: string) => Promise<void>;
/**
 * Composite images together (for configurable products)
 */
export declare const compositeImages: (imagePaths: string[], outputPath: string, layout?: "horizontal" | "vertical" | "overlay") => Promise<string>;
export {};
//# sourceMappingURL=imageService.d.ts.map
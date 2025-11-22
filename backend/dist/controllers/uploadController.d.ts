import { Request, Response, NextFunction } from 'express';
/**
 * Upload images (generic endpoint)
 * POST /api/admin/uploads/images
 */
export declare const uploadImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Upload single image
 * POST /api/admin/uploads/image
 */
export declare const uploadImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete image
 * DELETE /api/admin/uploads/image
 */
export declare const deleteImageFile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get upload statistics
 * GET /api/admin/uploads/stats
 */
export declare const getUploadStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Cleanup orphaned files (files not referenced in database)
 * POST /api/admin/uploads/cleanup
 */
export declare const cleanupOrphanedFiles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map
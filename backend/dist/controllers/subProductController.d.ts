import { Request, Response, NextFunction } from 'express';
/**
 * Get all subproducts with pagination and filtering
 * GET /api/admin/subproducts
 */
export declare const getSubProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get subproduct by ID
 * GET /api/admin/subproducts/:id
 */
export declare const getSubProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create new subproduct
 * POST /api/admin/subproducts
 */
export declare const createSubProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update subproduct
 * PUT /api/admin/subproducts/:id
 */
export declare const updateSubProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete subproduct
 * DELETE /api/admin/subproducts/:id
 */
export declare const deleteSubProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Upload images for subproduct
 * POST /api/admin/subproducts/:id/images
 */
export declare const uploadSubProductImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete image from subproduct
 * DELETE /api/admin/subproducts/:id/images/:imageIndex
 */
export declare const deleteSubProductImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Adjust stock
 * PUT /api/admin/subproducts/:id/stock
 */
export declare const adjustStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=subProductController.d.ts.map
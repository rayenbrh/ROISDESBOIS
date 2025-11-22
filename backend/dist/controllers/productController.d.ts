import { Request, Response, NextFunction } from 'express';
/**
 * Get all products with pagination and filtering
 * GET /api/admin/products
 */
export declare const getProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get product by ID
 * GET /api/admin/products/:id
 */
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create new product
 * POST /api/admin/products
 */
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update product
 * PUT /api/admin/products/:id
 */
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Upload images for product
 * POST /api/admin/products/:id/images
 */
export declare const uploadProductImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete image from product
 * DELETE /api/admin/products/:id/images/:imageIndex
 */
export declare const deleteProductImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate composite image for special product
 * POST /api/admin/products/:id/generate-composite
 */
export declare const generateComposite: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get composite generation job status
 * GET /api/admin/products/composite-job/:jobId
 */
export declare const getCompositeJobStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Adjust stock
 * PUT /api/admin/products/:id/stock
 */
export declare const adjustStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map
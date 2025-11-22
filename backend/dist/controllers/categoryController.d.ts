import { Request, Response, NextFunction } from 'express';
/**
 * Get all categories with optional tree structure
 * GET /api/admin/categories
 */
export declare const getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get category by ID
 * GET /api/admin/categories/:id
 */
export declare const getCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create new category
 * POST /api/admin/categories
 */
export declare const createCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update category
 * PUT /api/admin/categories/:id
 */
export declare const updateCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
export declare const deleteCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Reorder categories
 * PUT /api/admin/categories/reorder
 */
export declare const reorderCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=categoryController.d.ts.map
import { Request, Response, NextFunction } from 'express';
/**
 * Get settings
 * GET /api/admin/settings
 */
export declare const getSettings: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update settings
 * PUT /api/admin/settings
 */
export declare const updateSettings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Upload company logo
 * POST /api/admin/settings/logo
 */
export declare const uploadLogo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete company logo
 * DELETE /api/admin/settings/logo
 */
export declare const deleteLogo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=settingsController.d.ts.map
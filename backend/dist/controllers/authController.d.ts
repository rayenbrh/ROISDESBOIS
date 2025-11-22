import { Request, Response, NextFunction } from 'express';
/**
 * Login
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Refresh token
 * POST /api/auth/refresh
 */
export declare const refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Logout
 * POST /api/auth/logout
 */
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get current user
 * GET /api/auth/me
 */
export declare const getCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map
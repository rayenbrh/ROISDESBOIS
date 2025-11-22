import { Request, Response, NextFunction } from 'express';
/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
export declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
export declare const getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create new user
 * POST /api/admin/users
 */
export declare const createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update user
 * PUT /api/admin/users/:id
 */
export declare const updateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete user (soft delete - set isActive to false)
 * DELETE /api/admin/users/:id
 */
export declare const deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Change user password
 * PUT /api/admin/users/:id/password
 */
export declare const changePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Assign commercial to client
 * PUT /api/admin/users/:id/assign-commercial
 */
export declare const assignCommercial: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get users by role (e.g., all commercials)
 * GET /api/admin/users/role/:role
 */
export declare const getUsersByRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map
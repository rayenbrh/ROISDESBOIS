import { Request, Response, NextFunction } from 'express';
/**
 * Get all audit logs with pagination and filtering
 * GET /api/admin/auditlogs
 */
export declare const getAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get audit log by ID
 * GET /api/admin/auditlogs/:id
 */
export declare const getAuditLogById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get audit logs for a specific resource
 * GET /api/admin/auditlogs/resource/:resourceType/:resourceId
 */
export declare const getResourceAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get audit logs for a specific user
 * GET /api/admin/auditlogs/user/:userId
 */
export declare const getUserAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get audit log statistics
 * GET /api/admin/auditlogs/stats
 */
export declare const getAuditLogStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete old audit logs (cleanup)
 * DELETE /api/admin/auditlogs/cleanup
 */
export declare const cleanupOldLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auditLogController.d.ts.map
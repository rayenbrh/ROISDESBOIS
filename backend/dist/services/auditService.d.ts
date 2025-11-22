import { AuditAction } from '../types';
import { Types } from 'mongoose';
interface AuditLogData {
    userId?: string | Types.ObjectId;
    actionType: AuditAction;
    resourceType: string;
    resourceId?: string | Types.ObjectId;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * Create audit log entry
 */
export declare const createAuditLog: (data: AuditLogData) => Promise<void>;
/**
 * Log user login
 */
export declare const logLogin: (userId: string, ipAddress?: string, userAgent?: string) => Promise<void>;
/**
 * Log user logout
 */
export declare const logLogout: (userId: string, ipAddress?: string, userAgent?: string) => Promise<void>;
/**
 * Log resource creation
 */
export declare const logCreate: (userId: string, resourceType: string, resourceId: string, details?: Record<string, any>) => Promise<void>;
/**
 * Log resource update
 */
export declare const logUpdate: (userId: string, resourceType: string, resourceId: string, details?: Record<string, any>) => Promise<void>;
/**
 * Log resource deletion
 */
export declare const logDelete: (userId: string, resourceType: string, resourceId: string, details?: Record<string, any>) => Promise<void>;
/**
 * Log status change
 */
export declare const logStatusChange: (userId: string, resourceType: string, resourceId: string, oldStatus: string, newStatus: string, details?: Record<string, any>) => Promise<void>;
/**
 * Log payment
 */
export declare const logPayment: (userId: string, resourceType: string, resourceId: string, amount: number, details?: Record<string, any>) => Promise<void>;
/**
 * Log stock adjustment
 */
export declare const logStockAdjustment: (userId: string, resourceType: string, resourceId: string, oldStock: number, newStock: number, reason?: string) => Promise<void>;
export {};
//# sourceMappingURL=auditService.d.ts.map
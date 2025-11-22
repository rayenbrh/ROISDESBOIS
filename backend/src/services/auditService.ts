import { AuditLog } from '../models';
import { AuditAction } from '../types';
import { Types } from 'mongoose';
import logger from '../config/logger';

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
export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await AuditLog.create(data);
    logger.info(`Audit log created: ${data.actionType} on ${data.resourceType}`);
  } catch (error) {
    logger.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

/**
 * Log user login
 */
export const logLogin = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.LOGIN,
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  });
};

/**
 * Log user logout
 */
export const logLogout = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.LOGOUT,
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  });
};

/**
 * Log resource creation
 */
export const logCreate = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.CREATE,
    resourceType,
    resourceId,
    details
  });
};

/**
 * Log resource update
 */
export const logUpdate = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.UPDATE,
    resourceType,
    resourceId,
    details
  });
};

/**
 * Log resource deletion
 */
export const logDelete = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.DELETE,
    resourceType,
    resourceId,
    details
  });
};

/**
 * Log status change
 */
export const logStatusChange = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  oldStatus: string,
  newStatus: string,
  details?: Record<string, any>
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.STATUS_CHANGE,
    resourceType,
    resourceId,
    details: {
      oldStatus,
      newStatus,
      ...details
    }
  });
};

/**
 * Log payment
 */
export const logPayment = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  amount: number,
  details?: Record<string, any>
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.PAYMENT,
    resourceType,
    resourceId,
    details: {
      amount,
      ...details
    }
  });
};

/**
 * Log stock adjustment
 */
export const logStockAdjustment = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  oldStock: number,
  newStock: number,
  reason?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    actionType: AuditAction.STOCK_ADJUSTMENT,
    resourceType,
    resourceId,
    details: {
      oldStock,
      newStock,
      difference: newStock - oldStock,
      reason
    }
  });
};

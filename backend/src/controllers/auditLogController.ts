import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { AuditAction } from '../types';
import logger from '../config/logger';

/**
 * Get all audit logs with pagination and filtering
 * GET /api/admin/auditlogs
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;
    const actionType = req.query.actionType as AuditAction | undefined;
    const resourceType = req.query.resourceType as string | undefined;
    const userId = req.query.userId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (actionType) filter.actionType = actionType;
    if (resourceType) filter.resourceType = resourceType;
    if (userId) filter.userId = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    sendPaginated(res, logs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log by ID
 * GET /api/admin/auditlogs/:id
 */
export const getAuditLogById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('userId', 'name email');

    if (!log) {
      sendError(res, 'Audit log not found', 404, 'LOG_NOT_FOUND');
      return;
    }

    sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for a specific resource
 * GET /api/admin/auditlogs/resource/:resourceType/:resourceId
 */
export const getResourceAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resourceType, resourceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const filter = {
      resourceType,
      resourceId
    };

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    sendPaginated(res, logs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for a specific user
 * GET /api/admin/auditlogs/user/:userId
 */
export const getUserAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ userId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments({ userId })
    ]);

    sendPaginated(res, logs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log statistics
 * GET /api/admin/auditlogs/stats
 */
export const getAuditLogStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Get action type breakdown
    const actionBreakdown = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get resource type breakdown
    const resourceBreakdown = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get most active users
    const activeUsers = await AuditLog.aggregate([
      { $match: { ...filter, userId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ]);

    // Get total count
    const totalLogs = await AuditLog.countDocuments(filter);

    sendSuccess(res, {
      totalLogs,
      actionBreakdown,
      resourceBreakdown,
      activeUsers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete old audit logs (cleanup)
 * DELETE /api/admin/auditlogs/cleanup
 */
export const cleanupOldLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { daysToKeep } = req.body;

    if (!daysToKeep || daysToKeep < 30) {
      sendError(
        res,
        'Must keep at least 30 days of audit logs',
        400,
        'INVALID_RETENTION_PERIOD'
      );
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    logger.info(
      `Audit log cleanup: ${result.deletedCount} logs deleted (older than ${daysToKeep} days) by ${req.user?.email}`
    );

    sendSuccess(res, {
      message: 'Old audit logs deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

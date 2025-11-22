"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldLogs = exports.getAuditLogStats = exports.getUserAuditLogs = exports.getResourceAuditLogs = exports.getAuditLogById = exports.getAuditLogs = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Get all audit logs with pagination and filtering
 * GET /api/admin/auditlogs
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const actionType = req.query.actionType;
        const resourceType = req.query.resourceType;
        const userId = req.query.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (actionType)
            filter.actionType = actionType;
        if (resourceType)
            filter.resourceType = resourceType;
        if (userId)
            filter.userId = userId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            models_1.AuditLog.find(filter)
                .populate('userId', 'name email')
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.AuditLog.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, logs, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogs = getAuditLogs;
/**
 * Get audit log by ID
 * GET /api/admin/auditlogs/:id
 */
const getAuditLogById = async (req, res, next) => {
    try {
        const log = await models_1.AuditLog.findById(req.params.id)
            .populate('userId', 'name email');
        if (!log) {
            (0, apiResponse_1.sendError)(res, 'Audit log not found', 404, 'LOG_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, log);
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogById = getAuditLogById;
/**
 * Get audit logs for a specific resource
 * GET /api/admin/auditlogs/resource/:resourceType/:resourceId
 */
const getResourceAuditLogs = async (req, res, next) => {
    try {
        const { resourceType, resourceId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {
            resourceType,
            resourceId
        };
        const [logs, total] = await Promise.all([
            models_1.AuditLog.find(filter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            models_1.AuditLog.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, logs, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getResourceAuditLogs = getResourceAuditLogs;
/**
 * Get audit logs for a specific user
 * GET /api/admin/auditlogs/user/:userId
 */
const getUserAuditLogs = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            models_1.AuditLog.find({ userId })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            models_1.AuditLog.countDocuments({ userId })
        ]);
        (0, apiResponse_1.sendPaginated)(res, logs, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAuditLogs = getUserAuditLogs;
/**
 * Get audit log statistics
 * GET /api/admin/auditlogs/stats
 */
const getAuditLogStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Get action type breakdown
        const actionBreakdown = await models_1.AuditLog.aggregate([
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
        const resourceBreakdown = await models_1.AuditLog.aggregate([
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
        const activeUsers = await models_1.AuditLog.aggregate([
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
        const totalLogs = await models_1.AuditLog.countDocuments(filter);
        (0, apiResponse_1.sendSuccess)(res, {
            totalLogs,
            actionBreakdown,
            resourceBreakdown,
            activeUsers
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogStats = getAuditLogStats;
/**
 * Delete old audit logs (cleanup)
 * DELETE /api/admin/auditlogs/cleanup
 */
const cleanupOldLogs = async (req, res, next) => {
    try {
        const { daysToKeep } = req.body;
        if (!daysToKeep || daysToKeep < 30) {
            (0, apiResponse_1.sendError)(res, 'Must keep at least 30 days of audit logs', 400, 'INVALID_RETENTION_PERIOD');
            return;
        }
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await models_1.AuditLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
        logger_1.default.info(`Audit log cleanup: ${result.deletedCount} logs deleted (older than ${daysToKeep} days) by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, {
            message: 'Old audit logs deleted successfully',
            deletedCount: result.deletedCount
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanupOldLogs = cleanupOldLogs;
//# sourceMappingURL=auditLogController.js.map
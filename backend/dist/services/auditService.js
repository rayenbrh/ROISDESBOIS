"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStockAdjustment = exports.logPayment = exports.logStatusChange = exports.logDelete = exports.logUpdate = exports.logCreate = exports.logLogout = exports.logLogin = exports.createAuditLog = void 0;
const models_1 = require("../models");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Create audit log entry
 */
const createAuditLog = async (data) => {
    try {
        await models_1.AuditLog.create(data);
        logger_1.default.info(`Audit log created: ${data.actionType} on ${data.resourceType}`);
    }
    catch (error) {
        logger_1.default.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main flow
    }
};
exports.createAuditLog = createAuditLog;
/**
 * Log user login
 */
const logLogin = async (userId, ipAddress, userAgent) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.LOGIN,
        resourceType: 'user',
        resourceId: userId,
        ipAddress,
        userAgent
    });
};
exports.logLogin = logLogin;
/**
 * Log user logout
 */
const logLogout = async (userId, ipAddress, userAgent) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.LOGOUT,
        resourceType: 'user',
        resourceId: userId,
        ipAddress,
        userAgent
    });
};
exports.logLogout = logLogout;
/**
 * Log resource creation
 */
const logCreate = async (userId, resourceType, resourceId, details) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.CREATE,
        resourceType,
        resourceId,
        details
    });
};
exports.logCreate = logCreate;
/**
 * Log resource update
 */
const logUpdate = async (userId, resourceType, resourceId, details) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.UPDATE,
        resourceType,
        resourceId,
        details
    });
};
exports.logUpdate = logUpdate;
/**
 * Log resource deletion
 */
const logDelete = async (userId, resourceType, resourceId, details) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.DELETE,
        resourceType,
        resourceId,
        details
    });
};
exports.logDelete = logDelete;
/**
 * Log status change
 */
const logStatusChange = async (userId, resourceType, resourceId, oldStatus, newStatus, details) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.STATUS_CHANGE,
        resourceType,
        resourceId,
        details: {
            oldStatus,
            newStatus,
            ...details
        }
    });
};
exports.logStatusChange = logStatusChange;
/**
 * Log payment
 */
const logPayment = async (userId, resourceType, resourceId, amount, details) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.PAYMENT,
        resourceType,
        resourceId,
        details: {
            amount,
            ...details
        }
    });
};
exports.logPayment = logPayment;
/**
 * Log stock adjustment
 */
const logStockAdjustment = async (userId, resourceType, resourceId, oldStock, newStock, reason) => {
    await (0, exports.createAuditLog)({
        userId,
        actionType: types_1.AuditAction.STOCK_ADJUSTMENT,
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
exports.logStockAdjustment = logStockAdjustment;
//# sourceMappingURL=auditService.js.map
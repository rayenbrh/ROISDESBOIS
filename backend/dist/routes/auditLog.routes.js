"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLogController = __importStar(require("../controllers/auditLogController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const getAuditLogsQuerySchema = validate_2.paginationSchema.keys({
    actionType: joi_1.default.string().valid('create', 'update', 'delete', 'login', 'logout', 'status_change', 'payment', 'stock_adjustment'),
    resourceType: joi_1.default.string(),
    userId: validate_2.objectIdSchema,
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso()
});
const cleanupLogsSchema = joi_1.default.object({
    daysToKeep: joi_1.default.number().integer().min(30).required()
});
/**
 * @route   GET /api/admin/auditlogs/stats
 * @desc    Get audit log statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auditLogController.getAuditLogStats);
/**
 * @route   GET /api/admin/auditlogs/resource/:resourceType/:resourceId
 * @desc    Get audit logs for a specific resource
 * @access  Private (Admin only)
 */
router.get('/resource/:resourceType/:resourceId', auditLogController.getResourceAuditLogs);
/**
 * @route   GET /api/admin/auditlogs/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Private (Admin only)
 */
router.get('/user/:userId', auditLogController.getUserAuditLogs);
/**
 * @route   GET /api/admin/auditlogs
 * @desc    Get all audit logs with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/', (0, validate_1.validateQuery)(getAuditLogsQuerySchema), auditLogController.getAuditLogs);
/**
 * @route   GET /api/admin/auditlogs/:id
 * @desc    Get audit log by ID
 * @access  Private (Admin only)
 */
router.get('/:id', auditLogController.getAuditLogById);
/**
 * @route   DELETE /api/admin/auditlogs/cleanup
 * @desc    Delete old audit logs
 * @access  Private (Admin only)
 */
router.delete('/cleanup', (0, validate_1.validate)(cleanupLogsSchema), auditLogController.cleanupOldLogs);
exports.default = router;
//# sourceMappingURL=auditLog.routes.js.map
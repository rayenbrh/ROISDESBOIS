import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { objectIdSchema, paginationSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const getAuditLogsQuerySchema = paginationSchema.keys({
  actionType: Joi.string().valid('create', 'update', 'delete', 'login', 'logout', 'status_change', 'payment', 'stock_adjustment'),
  resourceType: Joi.string(),
  userId: objectIdSchema,
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});

const cleanupLogsSchema = Joi.object({
  daysToKeep: Joi.number().integer().min(30).required()
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
router.get('/', validateQuery(getAuditLogsQuerySchema), auditLogController.getAuditLogs);

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
router.delete('/cleanup', validate(cleanupLogsSchema), auditLogController.cleanupOldLogs);

export default router;

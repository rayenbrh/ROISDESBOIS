import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import Joi from 'joi';
import { emailSchema, passwordSchema, objectIdSchema, paginationSchema } from '../middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, adminOnly);

// Validation schemas
const userNameSchema = Joi.object({
  first: Joi.string().required(),
  last: Joi.string().allow('', null)
});

const createUserSchema = Joi.object({
  name: userNameSchema.required(),
  email: emailSchema,
  password: passwordSchema,
  role: Joi.string().valid('admin', 'commercial', 'store', 'client', 'cashier').required(),
  assignedCommercial: objectIdSchema.allow(null),
  storeId: objectIdSchema.allow(null),
  isActive: Joi.boolean()
});

const updateUserSchema = Joi.object({
  name: userNameSchema,
  email: emailSchema,
  role: Joi.string().valid('admin', 'commercial', 'store', 'client', 'cashier'),
  assignedCommercial: objectIdSchema.allow(null),
  storeId: objectIdSchema.allow(null),
  isActive: Joi.boolean()
});

const changePasswordSchema = Joi.object({
  password: passwordSchema
});

const assignCommercialSchema = Joi.object({
  commercialId: objectIdSchema.allow(null)
});

const getUsersQuerySchema = paginationSchema.keys({
  role: Joi.string().valid('admin', 'commercial', 'store', 'client', 'cashier'),
  search: Joi.string(),
  isActive: Joi.string().valid('true', 'false')
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/', validateQuery(getUsersQuerySchema), userController.getUsers);

/**
 * @route   GET /api/admin/users/role/:role
 * @desc    Get users by role
 * @access  Private (Admin only)
 */
router.get('/role/:role', userController.getUsersByRole);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', validate(createUserSchema), userController.createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id', validate(updateUserSchema), userController.updateUser);

/**
 * @route   PUT /api/admin/users/:id/password
 * @desc    Change user password
 * @access  Private (Admin only)
 */
router.put('/:id/password', validate(changePasswordSchema), userController.changePassword);

/**
 * @route   PUT /api/admin/users/:id/assign-commercial
 * @desc    Assign commercial to client
 * @access  Private (Admin only)
 */
router.put('/:id/assign-commercial', validate(assignCommercialSchema), userController.assignCommercial);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', userController.deleteUser);

export default router;

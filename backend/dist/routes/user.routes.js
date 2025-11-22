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
const userController = __importStar(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const userNameSchema = joi_1.default.object({
    first: joi_1.default.string().required(),
    last: joi_1.default.string().allow('', null)
});
const createUserSchema = joi_1.default.object({
    name: userNameSchema.required(),
    email: validate_2.emailSchema,
    password: validate_2.passwordSchema,
    role: joi_1.default.string().valid('admin', 'commercial', 'store', 'client', 'cashier').required(),
    assignedCommercial: validate_2.objectIdSchema.allow(null),
    storeId: validate_2.objectIdSchema.allow(null),
    isActive: joi_1.default.boolean()
});
const updateUserSchema = joi_1.default.object({
    name: userNameSchema,
    email: validate_2.emailSchema,
    role: joi_1.default.string().valid('admin', 'commercial', 'store', 'client', 'cashier'),
    assignedCommercial: validate_2.objectIdSchema.allow(null),
    storeId: validate_2.objectIdSchema.allow(null),
    isActive: joi_1.default.boolean()
});
const changePasswordSchema = joi_1.default.object({
    password: validate_2.passwordSchema
});
const assignCommercialSchema = joi_1.default.object({
    commercialId: validate_2.objectIdSchema.allow(null)
});
const getUsersQuerySchema = validate_2.paginationSchema.keys({
    role: joi_1.default.string().valid('admin', 'commercial', 'store', 'client', 'cashier'),
    search: joi_1.default.string(),
    isActive: joi_1.default.string().valid('true', 'false')
});
/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/', (0, validate_1.validateQuery)(getUsersQuerySchema), userController.getUsers);
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
router.post('/', (0, validate_1.validate)(createUserSchema), userController.createUser);
/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id', (0, validate_1.validate)(updateUserSchema), userController.updateUser);
/**
 * @route   PUT /api/admin/users/:id/password
 * @desc    Change user password
 * @access  Private (Admin only)
 */
router.put('/:id/password', (0, validate_1.validate)(changePasswordSchema), userController.changePassword);
/**
 * @route   PUT /api/admin/users/:id/assign-commercial
 * @desc    Assign commercial to client
 * @access  Private (Admin only)
 */
router.put('/:id/assign-commercial', (0, validate_1.validate)(assignCommercialSchema), userController.assignCommercial);
/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', userController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map
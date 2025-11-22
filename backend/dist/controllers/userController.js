"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.assignCommercial = exports.changePassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const logger_1 = __importDefault(require("../config/logger"));
const types_1 = require("../types");
/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const role = req.query.role;
        const search = req.query.search;
        const isActive = req.query.isActive;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (role)
            filter.role = role;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { 'name.first': { $regex: search, $options: 'i' } },
                { 'name.last': { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const [users, total] = await Promise.all([
            models_1.User.find(filter)
                .select('-passwordHash')
                .populate('assignedCommercial', 'name email')
                .sort({ [sort]: order })
                .skip(skip)
                .limit(limit),
            models_1.User.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, users, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await models_1.User.findById(req.params.id)
            .select('-passwordHash')
            .populate('assignedCommercial', 'name email');
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
/**
 * Create new user
 * POST /api/admin/users
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, assignedCommercial, storeId, isActive } = req.body;
        // Check if email already exists
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            (0, apiResponse_1.sendError)(res, 'Email already exists', 400, 'EMAIL_EXISTS');
            return;
        }
        // Create user
        const user = new models_1.User({
            name,
            email,
            passwordHash: password, // Will be hashed by pre-save hook
            role,
            assignedCommercial,
            storeId,
            isActive: isActive !== undefined ? isActive : true
        });
        await user.save();
        // Log creation
        if (req.user) {
            await (0, auditService_1.logCreate)(req.user.userId, 'user', user._id.toString(), {
                email: user.email,
                role: user.role
            });
        }
        logger_1.default.info(`User created: ${user.email} by ${req.user?.email}`);
        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        (0, apiResponse_1.sendSuccess)(res, userResponse, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
/**
 * Update user
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, assignedCommercial, storeId, isActive } = req.body;
        const user = await models_1.User.findById(req.params.id);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await models_1.User.findOne({ email });
            if (existingUser) {
                (0, apiResponse_1.sendError)(res, 'Email already exists', 400, 'EMAIL_EXISTS');
                return;
            }
            user.email = email;
        }
        // Update fields
        if (name)
            user.name = name;
        if (role)
            user.role = role;
        if (assignedCommercial !== undefined)
            user.assignedCommercial = assignedCommercial;
        if (storeId !== undefined)
            user.storeId = storeId;
        if (isActive !== undefined)
            user.isActive = isActive;
        await user.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'user', user._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`User updated: ${user.email} by ${req.user?.email}`);
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        (0, apiResponse_1.sendSuccess)(res, userResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
/**
 * Delete user (soft delete - set isActive to false)
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await models_1.User.findById(req.params.id);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        // Soft delete
        user.isActive = false;
        await user.save();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logDelete)(req.user.userId, 'user', user._id.toString(), {
                email: user.email
            });
        }
        logger_1.default.info(`User deleted (soft): ${user.email} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
/**
 * Change user password
 * PUT /api/admin/users/:id/password
 */
const changePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await models_1.User.findById(req.params.id);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        user.passwordHash = password; // Will be hashed by pre-save hook
        await user.save();
        // Log password change
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'user', user._id.toString(), {
                action: 'password_changed'
            });
        }
        logger_1.default.info(`Password changed for user: ${user.email} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
/**
 * Assign commercial to client
 * PUT /api/admin/users/:id/assign-commercial
 */
const assignCommercial = async (req, res, next) => {
    try {
        const { commercialId } = req.body;
        const user = await models_1.User.findById(req.params.id);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        // Verify commercial exists and has correct role
        if (commercialId) {
            const commercial = await models_1.User.findById(commercialId);
            if (!commercial || commercial.role !== types_1.UserRole.COMMERCIAL) {
                (0, apiResponse_1.sendError)(res, 'Invalid commercial user', 400, 'INVALID_COMMERCIAL');
                return;
            }
        }
        user.assignedCommercial = commercialId;
        await user.save();
        // Log assignment
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'user', user._id.toString(), {
                action: 'commercial_assigned',
                commercialId
            });
        }
        logger_1.default.info(`Commercial assigned to user: ${user.email} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.assignCommercial = assignCommercial;
/**
 * Get users by role (e.g., all commercials)
 * GET /api/admin/users/role/:role
 */
const getUsersByRole = async (req, res, next) => {
    try {
        const { role } = req.params;
        const users = await models_1.User.find({ role, isActive: true })
            .select('-passwordHash')
            .sort({ 'name.first': 1 });
        (0, apiResponse_1.sendSuccess)(res, users);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsersByRole = getUsersByRole;
//# sourceMappingURL=userController.js.map
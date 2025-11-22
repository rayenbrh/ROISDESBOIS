"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.refresh = exports.login = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await models_1.User.findOne({ email, isActive: true });
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
            return;
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            (0, apiResponse_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
            return;
        }
        // Generate tokens
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Log login
        await (0, auditService_1.logLogin)(user._id.toString(), req.ip, req.get('user-agent'));
        logger_1.default.info(`User logged in: ${user.email}`);
        (0, apiResponse_1.sendSuccess)(res, {
            accessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            (0, apiResponse_1.sendError)(res, 'No refresh token provided', 401, 'NO_REFRESH_TOKEN');
            return;
        }
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            // Verify user still exists and is active
            const user = await models_1.User.findById(decoded.userId).select('-passwordHash');
            if (!user || !user.isActive) {
                (0, apiResponse_1.sendError)(res, 'User not found or inactive', 401, 'INVALID_USER');
                return;
            }
            // Generate new access token
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            };
            const accessToken = (0, jwt_1.generateAccessToken)(payload);
            (0, apiResponse_1.sendSuccess)(res, { accessToken });
        }
        catch (error) {
            (0, apiResponse_1.sendError)(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        // Log logout if user is authenticated
        if (req.user) {
            await (0, auditService_1.logLogout)(req.user.userId, req.ip, req.get('user-agent'));
        }
        (0, apiResponse_1.sendSuccess)(res, { message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, apiResponse_1.sendError)(res, 'Not authenticated', 401, 'NOT_AUTHENTICATED');
            return;
        }
        const user = await models_1.User.findById(req.user.userId).select('-passwordHash');
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
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map
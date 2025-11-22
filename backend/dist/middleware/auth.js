"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrCommercial = exports.adminOnly = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const models_1 = require("../models");
const types_1 = require("../types");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, apiResponse_1.sendError)(res, 'No token provided', 401, 'UNAUTHORIZED');
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            // Verify user still exists and is active
            const user = await models_1.User.findById(decoded.userId).select('-passwordHash');
            if (!user || !user.isActive) {
                (0, apiResponse_1.sendError)(res, 'User not found or inactive', 401, 'UNAUTHORIZED');
                return;
            }
            req.user = {
                _id: user._id.toString(),
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            };
            next();
        }
        catch (error) {
            (0, apiResponse_1.sendError)(res, 'Invalid or expired token', 401, 'TOKEN_INVALID');
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Check if user has required role(s)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, apiResponse_1.sendError)(res, 'Authentication required', 401, 'UNAUTHORIZED');
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, apiResponse_1.sendError)(res, 'You do not have permission to perform this action', 403, 'FORBIDDEN');
            return;
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Admin only middleware
 */
exports.adminOnly = (0, exports.authorize)(types_1.UserRole.ADMIN);
/**
 * Admin or Commercial middleware
 */
exports.adminOrCommercial = (0, exports.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.COMMERCIAL);
//# sourceMappingURL=auth.js.map
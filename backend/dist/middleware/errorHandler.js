"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("../config/logger"));
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
    logger_1.default.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    // Mongoose validation error
    if (err instanceof mongoose_1.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e) => e.message);
        (0, apiResponse_1.sendError)(res, messages.join(', '), 400, 'VALIDATION_ERROR', err.errors);
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose_1.Error.CastError) {
        (0, apiResponse_1.sendError)(res, 'Invalid ID format', 400, 'INVALID_ID');
        return;
    }
    // Duplicate key error (unique constraint)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        (0, apiResponse_1.sendError)(res, `${field} already exists`, 409, 'DUPLICATE_KEY', {
            field
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        (0, apiResponse_1.sendError)(res, 'Invalid token', 401, 'INVALID_TOKEN');
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, apiResponse_1.sendError)(res, 'Token expired', 401, 'TOKEN_EXPIRED');
        return;
    }
    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            (0, apiResponse_1.sendError)(res, 'File too large', 400, 'FILE_TOO_LARGE');
            return;
        }
        (0, apiResponse_1.sendError)(res, err.message, 400, 'UPLOAD_ERROR');
        return;
    }
    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const code = err.code || 'INTERNAL_ERROR';
    (0, apiResponse_1.sendError)(res, message, statusCode, code);
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    (0, apiResponse_1.sendError)(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map
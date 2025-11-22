"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = exports.emailSchema = exports.localizedStringSchema = exports.paginationSchema = exports.objectIdSchema = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Generic validation middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            (0, apiResponse_1.sendError)(res, messages, 400, 'VALIDATION_ERROR', error.details);
            return;
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            (0, apiResponse_1.sendError)(res, messages, 400, 'VALIDATION_ERROR', error.details);
            return;
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
/**
 * Common validation schemas
 */
// ObjectId validation
exports.objectIdSchema = joi_1.default.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('Invalid ID format');
// Pagination schema
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sort: joi_1.default.string(),
    order: joi_1.default.string().valid('asc', 'desc').default('desc')
});
// Localized string schema
exports.localizedStringSchema = joi_1.default.object({
    ar: joi_1.default.string().required(),
    en: joi_1.default.string().allow('', null)
});
// Email schema
exports.emailSchema = joi_1.default.string()
    .email()
    .lowercase()
    .trim()
    .required();
// Password schema (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
exports.passwordSchema = joi_1.default.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must be at least 8 characters and contain uppercase, lowercase, and number')
    .required();
//# sourceMappingURL=validate.js.map
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/apiResponse';

/**
 * Generic validation middleware
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      sendError(res, messages, 400, 'VALIDATION_ERROR', error.details);
      return;
    }

    req.body = value;
    next();
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      sendError(res, messages, 400, 'VALIDATION_ERROR', error.details);
      return;
    }

    req.query = value;
    next();
  };
};

/**
 * Common validation schemas
 */

// ObjectId validation
export const objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// Localized string schema
export const localizedStringSchema = Joi.object({
  ar: Joi.string().required(),
  en: Joi.string().allow('', null)
});

// Email schema
export const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required();

// Password schema (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
export const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .message(
    'Password must be at least 8 characters and contain uppercase, lowercase, and number'
  )
  .required();

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
/**
 * Generic validation middleware
 */
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate query parameters
 */
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Common validation schemas
 */
export declare const objectIdSchema: Joi.StringSchema<string>;
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const localizedStringSchema: Joi.ObjectSchema<any>;
export declare const emailSchema: Joi.StringSchema<string>;
export declare const passwordSchema: Joi.StringSchema<string>;
//# sourceMappingURL=validate.d.ts.map
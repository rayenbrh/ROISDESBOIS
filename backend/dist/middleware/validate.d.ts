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
export declare const objectIdSchema: any;
export declare const paginationSchema: any;
export declare const localizedStringSchema: any;
export declare const emailSchema: any;
export declare const passwordSchema: any;
//# sourceMappingURL=validate.d.ts.map
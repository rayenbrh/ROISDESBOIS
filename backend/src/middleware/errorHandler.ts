import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import logger from '../config/logger';
import { sendError } from '../utils/apiResponse';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    sendError(res, messages.join(', '), 400, 'VALIDATION_ERROR', err.errors);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof MongooseError.CastError) {
    sendError(res, 'Invalid ID format', 400, 'INVALID_ID');
    return;
  }

  // Duplicate key error (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    sendError(res, `${field} already exists`, 409, 'DUPLICATE_KEY', {
      field
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File too large', 400, 'FILE_TOO_LARGE');
      return;
    }
    sendError(res, err.message, 400, 'UPLOAD_ERROR');
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  sendError(res, message, statusCode, code);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};

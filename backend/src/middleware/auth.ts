import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models';
import { UserRole, AuthTokenPayload } from '../types';
import { sendError } from '../utils/apiResponse';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload & { _id: string };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401, 'UNAUTHORIZED');
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      // Verify user still exists and is active
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || !user.isActive) {
        sendError(res, 'User not found or inactive', 401, 'UNAUTHORIZED');
        return;
      }

      req.user = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      sendError(res, 'Invalid or expired token', 401, 'TOKEN_INVALID');
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has required role(s)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize(UserRole.ADMIN);

/**
 * Admin or Commercial middleware
 */
export const adminOrCommercial = authorize(UserRole.ADMIN, UserRole.COMMERCIAL);

import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logLogin, logLogout } from '../services/auditService';
import logger from '../config/logger';
import { transformUser } from '../utils/userTransform';

/**
 * Login
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      return;
    }

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
    await logLogin(user._id.toString(), req.ip, req.get('user-agent'));

    logger.info(`User logged in: ${user.email}`);

    sendSuccess(res, {
    accessToken,
    user: transformUser(user)
  });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      sendError(res, 'No refresh token provided', 401, 'NO_REFRESH_TOKEN');
      return;
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || !user.isActive) {
        sendError(res, 'User not found or inactive', 401, 'INVALID_USER');
        return;
      }

      // Generate new access token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(payload);

      sendSuccess(res, { accessToken });
    } catch (error) {
      sendError(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    // Log logout if user is authenticated
    if (req.user) {
      await logLogout(req.user.userId, req.ip, req.get('user-agent'));
    }

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401, 'NOT_AUTHENTICATED');
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, transformUser(user));

  } catch (error) {
    next(error);
  }
};

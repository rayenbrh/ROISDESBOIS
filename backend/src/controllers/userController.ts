import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logDelete } from '../services/auditService';
import logger from '../config/logger';
import { UserRole } from '../types';

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;
    const role = req.query.role as UserRole | undefined;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive as string | undefined;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { 'name.first': { $regex: search, $options: 'i' } },
        { 'name.last': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .populate('assignedCommercial', 'name email')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    sendPaginated(res, users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('assignedCommercial', 'name email');

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/admin/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, assignedCommercial, storeId, isActive } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'Email already exists', 400, 'EMAIL_EXISTS');
      return;
    }

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role,
      assignedCommercial,
      storeId,
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'user', user._id.toString(), {
        email: user.email,
        role: user.role
      });
    }

    logger.info(`User created: ${user.email} by ${req.user?.email}`);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    sendSuccess(res, userResponse, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/admin/users/:id
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, role, assignedCommercial, storeId, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendError(res, 'Email already exists', 400, 'EMAIL_EXISTS');
        return;
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (assignedCommercial !== undefined) user.assignedCommercial = assignedCommercial;
    if (storeId !== undefined) user.storeId = storeId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'user', user._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`User updated: ${user.email} by ${req.user?.email}`);

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    sendSuccess(res, userResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (soft delete - set isActive to false)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    // Log deletion
    if (req.user) {
      await logDelete(req.user.userId, 'user', user._id.toString(), {
        email: user.email
      });
    }

    logger.info(`User deleted (soft): ${user.email} by ${req.user?.email}`);

    sendSuccess(res, { message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/admin/users/:id/password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    user.passwordHash = password; // Will be hashed by pre-save hook
    await user.save();

    // Log password change
    if (req.user) {
      await logUpdate(req.user.userId, 'user', user._id.toString(), {
        action: 'password_changed'
      });
    }

    logger.info(`Password changed for user: ${user.email} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign commercial to client
 * PUT /api/admin/users/:id/assign-commercial
 */
export const assignCommercial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commercialId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    // Verify commercial exists and has correct role
    if (commercialId) {
      const commercial = await User.findById(commercialId);
      if (!commercial || commercial.role !== UserRole.COMMERCIAL) {
        sendError(res, 'Invalid commercial user', 400, 'INVALID_COMMERCIAL');
        return;
      }
    }

    user.assignedCommercial = commercialId;
    await user.save();

    // Log assignment
    if (req.user) {
      await logUpdate(req.user.userId, 'user', user._id.toString(), {
        action: 'commercial_assigned',
        commercialId
      });
    }

    logger.info(`Commercial assigned to user: ${user.email} by ${req.user?.email}`);

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by role (e.g., all commercials)
 * GET /api/admin/users/role/:role
 */
export const getUsersByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.params;

    const users = await User.find({ role, isActive: true })
      .select('-passwordHash')
      .sort({ 'name.first': 1 });

    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

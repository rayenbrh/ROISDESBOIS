import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/reset-password', resetUserPassword);

export default router;

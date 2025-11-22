import express from 'express';
import {
  login,
  refresh,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

export default router;

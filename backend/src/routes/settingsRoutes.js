import express from 'express';
import { getSettings, updateSettings, uploadLogo, deleteLogo } from '../controllers/settingsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);
router.post('/logo', authenticate, requireAdmin, upload.single('logo'), uploadLogo);
router.delete('/logo', authenticate, requireAdmin, deleteLogo);

export default router;

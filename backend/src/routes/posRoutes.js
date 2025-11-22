import express from 'express';
import {
  getPOSSales,
  getPOSSaleById,
  createPOSSale,
  getPOSSalesStats,
} from '../controllers/posController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/summary', authenticate, getPOSSalesStats);
router.get('/', authenticate, getPOSSales);
router.get('/:id', authenticate, getPOSSaleById);
router.post('/', authenticate, createPOSSale);

export default router;

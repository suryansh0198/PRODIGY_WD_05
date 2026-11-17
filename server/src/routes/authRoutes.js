import express from 'express';
import {
  register,
  login,
  getMe,
  updatePreferences,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validatePreferences,
} from '../middleware/validateAuth.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (require JWT Bearer token)
router.get('/me', protect, getMe);
router.put('/preferences', protect, validatePreferences, updatePreferences);

export default router;

import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { validateRequest } from '../utils/validation';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
} from '../utils/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
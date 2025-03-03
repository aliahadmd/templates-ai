import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateProfile,
  changePassword
} from '../controllers/userController';
import { protect, adminOnly, hasPermission } from '../middlewares/authMiddleware';
import { validateRequest } from '../utils/validation';
import {
  updateUserSchema,
  changePasswordSchema
} from '../utils/validation';

const router = express.Router();

// User routes - specific routes should come before parameterized routes
router.put('/profile', protect, validateRequest(updateUserSchema), updateProfile);
router.put('/change-password', protect, validateRequest(changePasswordSchema), changePassword);

// Admin routes
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, validateRequest(updateUserSchema), updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.put('/:id/role', protect, adminOnly, updateUserRole);

export default router; 
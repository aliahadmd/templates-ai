import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { ApiError } from '../middlewares/errorMiddleware';
import { UpdateUserInput, ChangePasswordInput } from '../utils/validation';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const total = await prisma.user.count();

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email }: UpdateUserInput = req.body;
  const userId = req.params.id;

  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userExists) {
    throw new ApiError(404, 'User not found');
  }

  // Check if email is already taken
  if (email && email !== userExists.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email }
    });

    if (emailTaken) {
      throw new ApiError(400, 'Email already taken');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email })
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userExists) {
    throw new ApiError(404, 'User not found');
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId }
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.body;
  const userId = req.params.id;

  if (!roleId) {
    throw new ApiError(400, 'Role ID is required');
  }

  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userExists) {
    throw new ApiError(404, 'User not found');
  }

  // Check if role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!roleExists) {
    throw new ApiError(404, 'Role not found');
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      roleId
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: updatedUser
  });
});

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email }: UpdateUserInput = req.body;
  const userId = req.user!.id;

  // Check if email is already taken
  if (email && email !== req.user!.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email }
    });

    if (emailTaken) {
      throw new ApiError(400, 'Email already taken');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email })
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword }: ChangePasswordInput = req.body;
  const userId = req.user!.id;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if current password is correct
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword
    }
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});
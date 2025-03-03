import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { ApiError } from '../middlewares/errorMiddleware';
import { generateToken, generateRefreshToken, getRefreshTokenExpiryDate, verifyToken } from '../config/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  RefreshTokenInput
} from '../utils/validation';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName }: RegisterInput = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  // Get default role (user)
  const userRole = await prisma.role.findFirst({
    where: { name: 'user' }
  });

  if (!userRole) {
    throw new ApiError(500, 'Default role not found');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: userRole.id,
      verificationToken
    }
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate()
    }
  });

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      accessToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginInput = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate()
    }
  });

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      role: {
        id: user.role.id,
        name: user.role.name
      },
      accessToken
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  // Clear cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: tokenFromBody }: RefreshTokenInput = req.body;
  const tokenFromCookie = req.cookies.refreshToken;
  
  const token = tokenFromCookie || tokenFromBody;
  
  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  // Find token in database
  const refreshTokenDoc = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!refreshTokenDoc) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > refreshTokenDoc.expiresAt) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: refreshTokenDoc.id }
    });
    
    throw new ApiError(401, 'Refresh token expired');
  }

  // Generate new tokens
  const accessToken = generateToken(refreshTokenDoc.user.id);
  const newRefreshToken = generateRefreshToken(refreshTokenDoc.user.id);
  
  // Update refresh token in database
  await prisma.refreshToken.update({
    where: { id: refreshTokenDoc.id },
    data: {
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    }
  });

  // Set new refresh token as HTTP-only cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken
    }
  });
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token }: VerifyEmailInput = req.body;

  // Find user with verification token
  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid verification token');
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null
    }
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email }: ForgotPasswordInput = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal that the user doesn't exist
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Set token expiry (1 hour)
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry
    }
  });

  // Send password reset email
  await sendPasswordResetEmail(email, resetToken);

  res.status(200).json({
    success: true,
    message: 'If your email is registered, you will receive a password reset link'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password }: ResetPasswordInput = req.body;

  // Find user with reset token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Format permissions
  const permissions = user.role.permissions.map(
    (rp) => rp.permission.name
  );

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      role: {
        id: user.role.id,
        name: user.role.name
      },
      permissions
    }
  });
}); 
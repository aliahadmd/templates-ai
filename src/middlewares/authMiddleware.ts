import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { ApiError } from './errorMiddleware';
import prisma from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
      };
    }
  }
}

// Protect routes - verify JWT token
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback_secret'
        ) as jwt.JwtPayload;

        // Get user from token
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, roleId: true }
        });

        if (!user) {
          throw new ApiError(401, 'Not authorized, user not found');
        }

        // Set user in request
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        throw new ApiError(401, 'Not authorized, token failed');
      }
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token');
    }
  }
);

// Check if user has required permissions
export const hasPermission = (requiredPermission: string) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(401, 'Not authorized');
      }

      // Get user's role with permissions
      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!role) {
        throw new ApiError(403, 'Role not found');
      }

      // Check if user has the required permission
      const hasRequiredPermission = role.permissions.some(
        (rp) => rp.permission.name === requiredPermission
      );

      if (!hasRequiredPermission) {
        throw new ApiError(403, 'Insufficient permissions');
      }

      next();
    }
  );
};

// Admin only middleware
export const adminOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    // Get user's role
    const role = await prisma.role.findUnique({
      where: { id: req.user.roleId }
    });

    if (!role || role.name !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    next();
  }
); 
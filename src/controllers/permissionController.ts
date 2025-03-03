import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../lib/prisma';
import { ApiError } from '../middlewares/errorMiddleware';
import { CreatePermissionInput, UpdatePermissionInput } from '../utils/validation';

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private/Admin
export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({
    include: {
      _count: {
        select: {
          roles: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Format permissions
  const formattedPermissions = permissions.map((permission) => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
    roleCount: permission._count.roles,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt
  }));

  res.status(200).json({
    success: true,
    data: formattedPermissions
  });
});

// @desc    Get permission by ID
// @route   GET /api/permissions/:id
// @access  Private/Admin
export const getPermissionById = asyncHandler(async (req: Request, res: Response) => {
  const permission = await prisma.permission.findUnique({
    where: { id: req.params.id },
    include: {
      roles: {
        include: {
          role: true
        }
      },
      _count: {
        select: {
          roles: true
        }
      }
    }
  });

  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }

  // Format permission
  const formattedPermission = {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    roles: permission.roles.map((rp) => ({
      id: rp.role.id,
      name: rp.role.name,
      description: rp.role.description
    })),
    roleCount: permission._count.roles,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt
  };

  res.status(200).json({
    success: true,
    data: formattedPermission
  });
});

// @desc    Create permission
// @route   POST /api/permissions
// @access  Private/Admin
export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: CreatePermissionInput = req.body;

  // Check if permission already exists
  const permissionExists = await prisma.permission.findUnique({
    where: { name }
  });

  if (permissionExists) {
    throw new ApiError(400, 'Permission already exists');
  }

  // Create permission
  const permission = await prisma.permission.create({
    data: {
      name,
      description
    }
  });

  res.status(201).json({
    success: true,
    message: 'Permission created successfully',
    data: permission
  });
});

// @desc    Update permission
// @route   PUT /api/permissions/:id
// @access  Private/Admin
export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: UpdatePermissionInput = req.body;
  const permissionId = req.params.id;

  // Check if permission exists
  const permissionExists = await prisma.permission.findUnique({
    where: { id: permissionId }
  });

  if (!permissionExists) {
    throw new ApiError(404, 'Permission not found');
  }

  // Check if name is already taken
  if (name && name !== permissionExists.name) {
    const nameTaken = await prisma.permission.findUnique({
      where: { name }
    });

    if (nameTaken) {
      throw new ApiError(400, 'Permission name already taken');
    }
  }

  // Update permission
  const updatedPermission = await prisma.permission.update({
    where: { id: permissionId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description })
    }
  });

  res.status(200).json({
    success: true,
    message: 'Permission updated successfully',
    data: updatedPermission
  });
});

// @desc    Delete permission
// @route   DELETE /api/permissions/:id
// @access  Private/Admin
export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  const permissionId = req.params.id;

  // Check if permission exists
  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
    include: {
      _count: {
        select: {
          roles: true
        }
      }
    }
  });

  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }

  // Check if permission is assigned to any roles
  if (permission._count.roles > 0) {
    throw new ApiError(400, 'Cannot delete permission assigned to roles');
  }

  // Delete permission
  await prisma.permission.delete({
    where: { id: permissionId }
  });

  res.status(200).json({
    success: true,
    message: 'Permission deleted successfully'
  });
}); 
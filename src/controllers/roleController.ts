import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../lib/prisma';
import { ApiError } from '../middlewares/errorMiddleware';
import { CreateRoleInput, UpdateRoleInput, AssignPermissionInput } from '../utils/validation';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Format roles
  const formattedRoles = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description
    })),
    userCount: role._count.users,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  }));

  res.status(200).json({
    success: true,
    data: formattedRoles
  });
});

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private/Admin
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await prisma.role.findUnique({
    where: { id: req.params.id },
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  });

  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  // Format role
  const formattedRole = {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description
    })),
    userCount: role._count.users,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  };

  res.status(200).json({
    success: true,
    data: formattedRole
  });
});

// @desc    Create role
// @route   POST /api/roles
// @access  Private/Admin
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: CreateRoleInput = req.body;

  // Check if role already exists
  const roleExists = await prisma.role.findUnique({
    where: { name }
  });

  if (roleExists) {
    throw new ApiError(400, 'Role already exists');
  }

  // Create role
  const role = await prisma.role.create({
    data: {
      name,
      description
    }
  });

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: role
  });
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: UpdateRoleInput = req.body;
  const roleId = req.params.id;

  // Check if role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!roleExists) {
    throw new ApiError(404, 'Role not found');
  }

  // Check if name is already taken
  if (name && name !== roleExists.name) {
    const nameTaken = await prisma.role.findUnique({
      where: { name }
    });

    if (nameTaken) {
      throw new ApiError(400, 'Role name already taken');
    }
  }

  // Don't allow updating admin role name
  if (roleExists.name === 'admin' && name && name !== 'admin') {
    throw new ApiError(400, 'Cannot change admin role name');
  }

  // Update role
  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description })
    }
  });

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: updatedRole
  });
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = req.params.id;

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      _count: {
        select: {
          users: true
        }
      }
    }
  });

  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  // Don't allow deleting admin or user role
  if (role.name === 'admin' || role.name === 'user') {
    throw new ApiError(400, `Cannot delete ${role.name} role`);
  }

  // Check if role has users
  if (role._count.users > 0) {
    throw new ApiError(400, 'Cannot delete role with assigned users');
  }

  // Delete role
  await prisma.role.delete({
    where: { id: roleId }
  });

  res.status(200).json({
    success: true,
    message: 'Role deleted successfully'
  });
});

// @desc    Assign permission to role
// @route   POST /api/roles/:id/permissions
// @access  Private/Admin
export const assignPermission = asyncHandler(async (req: Request, res: Response) => {
  const { permissionId }: AssignPermissionInput = req.body;
  const roleId = req.params.id;

  // Check if role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!roleExists) {
    throw new ApiError(404, 'Role not found');
  }

  // Check if permission exists
  const permissionExists = await prisma.permission.findUnique({
    where: { id: permissionId }
  });

  if (!permissionExists) {
    throw new ApiError(404, 'Permission not found');
  }

  // Check if permission is already assigned
  const permissionAssigned = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId
      }
    }
  });

  if (permissionAssigned) {
    throw new ApiError(400, 'Permission already assigned to role');
  }

  // Assign permission
  await prisma.rolePermission.create({
    data: {
      roleId,
      permissionId
    }
  });

  res.status(200).json({
    success: true,
    message: 'Permission assigned successfully'
  });
});

// @desc    Remove permission from role
// @route   DELETE /api/roles/:id/permissions/:permissionId
// @access  Private/Admin
export const removePermission = asyncHandler(async (req: Request, res: Response) => {
  const roleId = req.params.id;
  const permissionId = req.params.permissionId;

  // Check if role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!roleExists) {
    throw new ApiError(404, 'Role not found');
  }

  // Check if permission exists
  const permissionExists = await prisma.permission.findUnique({
    where: { id: permissionId }
  });

  if (!permissionExists) {
    throw new ApiError(404, 'Permission not found');
  }

  // Check if permission is assigned
  const permissionAssigned = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId
      }
    }
  });

  if (!permissionAssigned) {
    throw new ApiError(400, 'Permission not assigned to role');
  }

  // Remove permission
  await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Permission removed successfully'
  });
}); 
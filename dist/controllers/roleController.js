"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePermission = exports.assignPermission = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
exports.getRoles = (0, express_async_handler_1.default)(async (req, res) => {
    const roles = await prisma_1.default.role.findMany({
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
exports.getRoleById = (0, express_async_handler_1.default)(async (req, res) => {
    const role = await prisma_1.default.role.findUnique({
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
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
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
exports.createRole = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description } = req.body;
    // Check if role already exists
    const roleExists = await prisma_1.default.role.findUnique({
        where: { name }
    });
    if (roleExists) {
        throw new errorMiddleware_1.ApiError(400, 'Role already exists');
    }
    // Create role
    const role = await prisma_1.default.role.create({
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
exports.updateRole = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description } = req.body;
    const roleId = req.params.id;
    // Check if role exists
    const roleExists = await prisma_1.default.role.findUnique({
        where: { id: roleId }
    });
    if (!roleExists) {
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
    }
    // Check if name is already taken
    if (name && name !== roleExists.name) {
        const nameTaken = await prisma_1.default.role.findUnique({
            where: { name }
        });
        if (nameTaken) {
            throw new errorMiddleware_1.ApiError(400, 'Role name already taken');
        }
    }
    // Don't allow updating admin role name
    if (roleExists.name === 'admin' && name && name !== 'admin') {
        throw new errorMiddleware_1.ApiError(400, 'Cannot change admin role name');
    }
    // Update role
    const updatedRole = await prisma_1.default.role.update({
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
exports.deleteRole = (0, express_async_handler_1.default)(async (req, res) => {
    const roleId = req.params.id;
    // Check if role exists
    const role = await prisma_1.default.role.findUnique({
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
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
    }
    // Don't allow deleting admin or user role
    if (role.name === 'admin' || role.name === 'user') {
        throw new errorMiddleware_1.ApiError(400, `Cannot delete ${role.name} role`);
    }
    // Check if role has users
    if (role._count.users > 0) {
        throw new errorMiddleware_1.ApiError(400, 'Cannot delete role with assigned users');
    }
    // Delete role
    await prisma_1.default.role.delete({
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
exports.assignPermission = (0, express_async_handler_1.default)(async (req, res) => {
    const { permissionId } = req.body;
    const roleId = req.params.id;
    // Check if role exists
    const roleExists = await prisma_1.default.role.findUnique({
        where: { id: roleId }
    });
    if (!roleExists) {
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
    }
    // Check if permission exists
    const permissionExists = await prisma_1.default.permission.findUnique({
        where: { id: permissionId }
    });
    if (!permissionExists) {
        throw new errorMiddleware_1.ApiError(404, 'Permission not found');
    }
    // Check if permission is already assigned
    const permissionAssigned = await prisma_1.default.rolePermission.findUnique({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId
            }
        }
    });
    if (permissionAssigned) {
        throw new errorMiddleware_1.ApiError(400, 'Permission already assigned to role');
    }
    // Assign permission
    await prisma_1.default.rolePermission.create({
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
exports.removePermission = (0, express_async_handler_1.default)(async (req, res) => {
    const roleId = req.params.id;
    const permissionId = req.params.permissionId;
    // Check if role exists
    const roleExists = await prisma_1.default.role.findUnique({
        where: { id: roleId }
    });
    if (!roleExists) {
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
    }
    // Check if permission exists
    const permissionExists = await prisma_1.default.permission.findUnique({
        where: { id: permissionId }
    });
    if (!permissionExists) {
        throw new errorMiddleware_1.ApiError(404, 'Permission not found');
    }
    // Check if permission is assigned
    const permissionAssigned = await prisma_1.default.rolePermission.findUnique({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId
            }
        }
    });
    if (!permissionAssigned) {
        throw new errorMiddleware_1.ApiError(400, 'Permission not assigned to role');
    }
    // Remove permission
    await prisma_1.default.rolePermission.delete({
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
//# sourceMappingURL=roleController.js.map
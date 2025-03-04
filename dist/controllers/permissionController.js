"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermissionById = exports.getPermissions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private/Admin
exports.getPermissions = (0, express_async_handler_1.default)(async (req, res) => {
    const permissions = await prisma_1.default.permission.findMany({
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
exports.getPermissionById = (0, express_async_handler_1.default)(async (req, res) => {
    const permission = await prisma_1.default.permission.findUnique({
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
        throw new errorMiddleware_1.ApiError(404, 'Permission not found');
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
exports.createPermission = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description } = req.body;
    // Check if permission already exists
    const permissionExists = await prisma_1.default.permission.findUnique({
        where: { name }
    });
    if (permissionExists) {
        throw new errorMiddleware_1.ApiError(400, 'Permission already exists');
    }
    // Create permission
    const permission = await prisma_1.default.permission.create({
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
exports.updatePermission = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description } = req.body;
    const permissionId = req.params.id;
    // Check if permission exists
    const permissionExists = await prisma_1.default.permission.findUnique({
        where: { id: permissionId }
    });
    if (!permissionExists) {
        throw new errorMiddleware_1.ApiError(404, 'Permission not found');
    }
    // Check if name is already taken
    if (name && name !== permissionExists.name) {
        const nameTaken = await prisma_1.default.permission.findUnique({
            where: { name }
        });
        if (nameTaken) {
            throw new errorMiddleware_1.ApiError(400, 'Permission name already taken');
        }
    }
    // Update permission
    const updatedPermission = await prisma_1.default.permission.update({
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
exports.deletePermission = (0, express_async_handler_1.default)(async (req, res) => {
    const permissionId = req.params.id;
    // Check if permission exists
    const permission = await prisma_1.default.permission.findUnique({
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
        throw new errorMiddleware_1.ApiError(404, 'Permission not found');
    }
    // Check if permission is assigned to any roles
    if (permission._count.roles > 0) {
        throw new errorMiddleware_1.ApiError(400, 'Cannot delete permission assigned to roles');
    }
    // Delete permission
    await prisma_1.default.permission.delete({
        where: { id: permissionId }
    });
    res.status(200).json({
        success: true,
        message: 'Permission deleted successfully'
    });
});
//# sourceMappingURL=permissionController.js.map
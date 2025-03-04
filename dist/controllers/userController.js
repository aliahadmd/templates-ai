"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.updateUserRole = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await prisma_1.default.user.findMany({
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
    const total = await prisma_1.default.user.count();
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
exports.getUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
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
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        data: user
    });
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const userId = req.params.id;
    // Check if user exists
    const userExists = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!userExists) {
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    // Check if email is already taken
    if (email && email !== userExists.email) {
        const emailTaken = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (emailTaken) {
            throw new errorMiddleware_1.ApiError(400, 'Email already taken');
        }
    }
    // Update user
    const updatedUser = await prisma_1.default.user.update({
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
exports.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.params.id;
    // Check if user exists
    const userExists = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!userExists) {
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    // Delete user
    await prisma_1.default.user.delete({
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
exports.updateUserRole = (0, express_async_handler_1.default)(async (req, res) => {
    const { roleId } = req.body;
    const userId = req.params.id;
    if (!roleId) {
        throw new errorMiddleware_1.ApiError(400, 'Role ID is required');
    }
    // Check if user exists
    const userExists = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!userExists) {
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    // Check if role exists
    const roleExists = await prisma_1.default.role.findUnique({
        where: { id: roleId }
    });
    if (!roleExists) {
        throw new errorMiddleware_1.ApiError(404, 'Role not found');
    }
    // Update user role
    const updatedUser = await prisma_1.default.user.update({
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
exports.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const { firstName, lastName, email, profilePicture, profilePictureKey } = req.body;
    const userId = req.user.id;
    // Check if email is already taken
    if (email && email !== req.user.email) {
        const emailTaken = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (emailTaken) {
            throw new errorMiddleware_1.ApiError(400, 'Email already taken');
        }
    }
    // Update user
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(profilePicture !== undefined && { profilePicture }),
            ...(profilePictureKey !== undefined && { profilePictureKey })
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            profilePictureKey: true,
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
exports.changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    // Get user with password
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    // Check if current password is correct
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new errorMiddleware_1.ApiError(401, 'Current password is incorrect');
    }
    // Hash new password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
    // Update password
    await prisma_1.default.user.update({
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
//# sourceMappingURL=userController.js.map
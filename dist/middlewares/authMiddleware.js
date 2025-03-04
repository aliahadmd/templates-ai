"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.hasPermission = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const errorMiddleware_1 = require("./errorMiddleware");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Protect routes - verify JWT token
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // Get token from Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            // Get user from token
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, roleId: true }
            });
            if (!user) {
                throw new errorMiddleware_1.ApiError(401, 'Not authorized, user not found');
            }
            // Set user in request
            req.user = user;
            next();
        }
        catch (error) {
            console.error(error);
            throw new errorMiddleware_1.ApiError(401, 'Not authorized, token failed');
        }
    }
    if (!token) {
        throw new errorMiddleware_1.ApiError(401, 'Not authorized, no token');
    }
});
// Check if user has required permissions
const hasPermission = (requiredPermission) => {
    return (0, express_async_handler_1.default)(async (req, res, next) => {
        if (!req.user) {
            throw new errorMiddleware_1.ApiError(401, 'Not authorized');
        }
        // Get user's role with permissions
        const role = await prisma_1.default.role.findUnique({
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
            throw new errorMiddleware_1.ApiError(403, 'Role not found');
        }
        // Check if user has the required permission
        const hasRequiredPermission = role.permissions.some((rp) => rp.permission.name === requiredPermission);
        if (!hasRequiredPermission) {
            throw new errorMiddleware_1.ApiError(403, 'Insufficient permissions');
        }
        next();
    });
};
exports.hasPermission = hasPermission;
// Admin only middleware
exports.adminOnly = (0, express_async_handler_1.default)(async (req, res, next) => {
    if (!req.user) {
        throw new errorMiddleware_1.ApiError(401, 'Not authorized');
    }
    // Get user's role
    const role = await prisma_1.default.role.findUnique({
        where: { id: req.user.roleId }
    });
    if (!role || role.name !== 'admin') {
        throw new errorMiddleware_1.ApiError(403, 'Admin access required');
    }
    next();
});
//# sourceMappingURL=authMiddleware.js.map
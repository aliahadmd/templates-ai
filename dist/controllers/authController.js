"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const jwt_1 = require("../config/jwt");
const email_1 = require("../config/email");
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    // Check if user already exists
    const userExists = await prisma_1.default.user.findUnique({
        where: { email }
    });
    if (userExists) {
        throw new errorMiddleware_1.ApiError(400, 'User already exists');
    }
    // Get default role (user)
    const userRole = await prisma_1.default.role.findFirst({
        where: { name: 'user' }
    });
    if (!userRole) {
        throw new errorMiddleware_1.ApiError(500, 'Default role not found');
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // Generate verification token
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    // Create user
    const user = await prisma_1.default.user.create({
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
    await (0, email_1.sendVerificationEmail)(email, verificationToken);
    // Generate tokens
    const accessToken = (0, jwt_1.generateToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    // Save refresh token to database
    await prisma_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: (0, jwt_1.getRefreshTokenExpiryDate)()
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
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    // Find user
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: { role: true }
    });
    if (!user) {
        throw new errorMiddleware_1.ApiError(401, 'Invalid credentials');
    }
    // Check password
    const isPasswordMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new errorMiddleware_1.ApiError(401, 'Invalid credentials');
    }
    // Generate tokens
    const accessToken = (0, jwt_1.generateToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    // Save refresh token to database
    await prisma_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: (0, jwt_1.getRefreshTokenExpiryDate)()
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
exports.logout = (0, express_async_handler_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        // Delete refresh token from database
        await prisma_1.default.refreshToken.deleteMany({
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
exports.refreshToken = (0, express_async_handler_1.default)(async (req, res) => {
    const { refreshToken: tokenFromBody } = req.body;
    const tokenFromCookie = req.cookies.refreshToken;
    const token = tokenFromCookie || tokenFromBody;
    if (!token) {
        throw new errorMiddleware_1.ApiError(401, 'Refresh token is required');
    }
    // Find token in database
    const refreshTokenDoc = await prisma_1.default.refreshToken.findUnique({
        where: { token },
        include: { user: true }
    });
    if (!refreshTokenDoc) {
        throw new errorMiddleware_1.ApiError(401, 'Invalid refresh token');
    }
    // Check if token is expired
    if (new Date() > refreshTokenDoc.expiresAt) {
        // Delete expired token
        await prisma_1.default.refreshToken.delete({
            where: { id: refreshTokenDoc.id }
        });
        throw new errorMiddleware_1.ApiError(401, 'Refresh token expired');
    }
    // Generate new tokens
    const accessToken = (0, jwt_1.generateToken)(refreshTokenDoc.user.id);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(refreshTokenDoc.user.id);
    // Update refresh token in database
    await prisma_1.default.refreshToken.update({
        where: { id: refreshTokenDoc.id },
        data: {
            token: newRefreshToken,
            expiresAt: (0, jwt_1.getRefreshTokenExpiryDate)()
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
exports.verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { token } = req.body;
    // Find user with verification token
    const user = await prisma_1.default.user.findFirst({
        where: { verificationToken: token }
    });
    if (!user) {
        throw new errorMiddleware_1.ApiError(400, 'Invalid verification token');
    }
    // Update user
    await prisma_1.default.user.update({
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
exports.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    // Find user
    const user = await prisma_1.default.user.findUnique({
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
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    // Set token expiry (1 hour)
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
    // Update user
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpiry
        }
    });
    // Send password reset email
    await (0, email_1.sendPasswordResetEmail)(email, resetToken);
    res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
    });
});
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { token, password } = req.body;
    // Find user with reset token
    const user = await prisma_1.default.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date()
            }
        }
    });
    if (!user) {
        throw new errorMiddleware_1.ApiError(400, 'Invalid or expired reset token');
    }
    // Hash new password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // Update user
    await prisma_1.default.user.update({
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
exports.getMe = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
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
        throw new errorMiddleware_1.ApiError(404, 'User not found');
    }
    // Format permissions
    const permissions = user.role.permissions.map((rp) => rp.permission.name);
    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
            profilePicture: user.profilePicture,
            profilePictureKey: user.profilePictureKey,
            role: {
                id: user.role.id,
                name: user.role.name
            },
            permissions
        }
    });
});
//# sourceMappingURL=authController.js.map
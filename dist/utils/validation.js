"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPermissionSchema = exports.updatePermissionSchema = exports.createPermissionSchema = exports.updateRoleSchema = exports.createRoleSchema = exports.changePasswordSchema = exports.updateUserSchema = exports.refreshTokenSchema = exports.verifyEmailSchema = exports.forgotPasswordSchema = exports.resetPasswordSchema = exports.loginSchema = exports.registerSchema = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
// Validate request body against a Zod schema
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = schema.parse(req[source]);
            req[source] = data;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                throw new errorMiddleware_1.ApiError(400, 'Validation error', formattedErrors);
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address')
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required')
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
// User schemas
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    profilePicture: zod_1.z.string().url('Profile picture must be a valid URL').or(zod_1.z.literal('')).optional().nullable(),
    profilePictureKey: zod_1.z.string().or(zod_1.z.literal('')).optional().nullable()
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
});
// Role schemas
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Role name must be at least 2 characters'),
    description: zod_1.z.string().optional()
});
exports.updateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Role name must be at least 2 characters').optional(),
    description: zod_1.z.string().optional()
});
// Permission schemas
exports.createPermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Permission name must be at least 2 characters'),
    description: zod_1.z.string().optional()
});
exports.updatePermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Permission name must be at least 2 characters').optional(),
    description: zod_1.z.string().optional()
});
// Role-Permission schemas
exports.assignPermissionSchema = zod_1.z.object({
    permissionId: zod_1.z.string().uuid('Invalid permission ID')
});
//# sourceMappingURL=validation.js.map
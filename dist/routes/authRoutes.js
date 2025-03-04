"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validation_1 = require("../utils/validation");
const validation_2 = require("../utils/validation");
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, validation_1.validateRequest)(validation_2.registerSchema), authController_1.register);
router.post('/login', (0, validation_1.validateRequest)(validation_2.loginSchema), authController_1.login);
router.post('/refresh-token', (0, validation_1.validateRequest)(validation_2.refreshTokenSchema), authController_1.refreshToken);
router.post('/verify-email', (0, validation_1.validateRequest)(validation_2.verifyEmailSchema), authController_1.verifyEmail);
router.post('/forgot-password', (0, validation_1.validateRequest)(validation_2.forgotPasswordSchema), authController_1.forgotPassword);
router.post('/reset-password', (0, validation_1.validateRequest)(validation_2.resetPasswordSchema), authController_1.resetPassword);
// Protected routes
router.post('/logout', authMiddleware_1.protect, authController_1.logout);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validation_1 = require("../utils/validation");
const validation_2 = require("../utils/validation");
const router = express_1.default.Router();
// User routes - specific routes should come before parameterized routes
router.put('/profile', authMiddleware_1.protect, (0, validation_1.validateRequest)(validation_2.updateUserSchema), userController_1.updateProfile);
router.put('/change-password', authMiddleware_1.protect, (0, validation_1.validateRequest)(validation_2.changePasswordSchema), userController_1.changePassword);
// Admin routes
router.get('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.getUsers);
router.get('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.getUserById);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, (0, validation_1.validateRequest)(validation_2.updateUserSchema), userController_1.updateUser);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.deleteUser);
router.put('/:id/role', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map
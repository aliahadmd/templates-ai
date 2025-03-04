"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permissionController_1 = require("../controllers/permissionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validation_1 = require("../utils/validation");
const validation_2 = require("../utils/validation");
const router = express_1.default.Router();
// All routes are admin-only
router.use(authMiddleware_1.protect, authMiddleware_1.adminOnly);
router.get('/', permissionController_1.getPermissions);
router.get('/:id', permissionController_1.getPermissionById);
router.post('/', (0, validation_1.validateRequest)(validation_2.createPermissionSchema), permissionController_1.createPermission);
router.put('/:id', (0, validation_1.validateRequest)(validation_2.updatePermissionSchema), permissionController_1.updatePermission);
router.delete('/:id', permissionController_1.deletePermission);
exports.default = router;
//# sourceMappingURL=permissionRoutes.js.map
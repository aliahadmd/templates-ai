"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validation_1 = require("../utils/validation");
const validation_2 = require("../utils/validation");
const router = express_1.default.Router();
// All routes are admin-only
router.use(authMiddleware_1.protect, authMiddleware_1.adminOnly);
router.get('/', roleController_1.getRoles);
router.get('/:id', roleController_1.getRoleById);
router.post('/', (0, validation_1.validateRequest)(validation_2.createRoleSchema), roleController_1.createRole);
router.put('/:id', (0, validation_1.validateRequest)(validation_2.updateRoleSchema), roleController_1.updateRole);
router.delete('/:id', roleController_1.deleteRole);
router.post('/:id/permissions', (0, validation_1.validateRequest)(validation_2.assignPermissionSchema), roleController_1.assignPermission);
router.delete('/:id/permissions/:permissionId', roleController_1.removePermission);
exports.default = router;
//# sourceMappingURL=roleRoutes.js.map
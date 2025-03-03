import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermission,
  removePermission
} from '../controllers/roleController';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { validateRequest } from '../utils/validation';
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionSchema
} from '../utils/validation';

const router = express.Router();

// All routes are admin-only
router.use(protect, adminOnly);

router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', validateRequest(createRoleSchema), createRole);
router.put('/:id', validateRequest(updateRoleSchema), updateRole);
router.delete('/:id', deleteRole);
router.post('/:id/permissions', validateRequest(assignPermissionSchema), assignPermission);
router.delete('/:id/permissions/:permissionId', removePermission);

export default router; 
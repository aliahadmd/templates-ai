import express from 'express';
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
} from '../controllers/permissionController';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { validateRequest } from '../utils/validation';
import {
  createPermissionSchema,
  updatePermissionSchema
} from '../utils/validation';

const router = express.Router();

// All routes are admin-only
router.use(protect, adminOnly);

router.get('/', getPermissions);
router.get('/:id', getPermissionById);
router.post('/', validateRequest(createPermissionSchema), createPermission);
router.put('/:id', validateRequest(updatePermissionSchema), updatePermission);
router.delete('/:id', deletePermission);

export default router; 
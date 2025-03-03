import express from 'express';
import uploadController, { uploadMiddleware } from '../controllers/uploadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Generate presigned URL for direct uploads
router.post('/presigned', uploadController.getPresignedUrl);

// Proxy upload to handle CORS issues
router.post('/proxy', uploadMiddleware, uploadController.proxyUpload);

// Delete a file
router.delete('/:key', uploadController.deleteFile);

export default router; 
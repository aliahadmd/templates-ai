import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../middlewares/errorMiddleware';
import * as storageService from '../services/storageService';
import axios from 'axios';
import multer from 'multer';
import path from 'path';

// Configure multer for temporary file storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to handle file upload
export const uploadMiddleware = upload.single('file');

// Extend Express Request type to include file from multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

/**
 * @desc    Generate a presigned URL for direct uploads
 * @route   POST /api/uploads/presigned
 * @access  Private
 */
export const getPresignedUrl = asyncHandler(async (req: Request, res: Response) => {
  const { filename, contentType } = req.body;

  if (!filename || !contentType) {
    throw new ApiError(400, 'Filename and content type are required');
  }

  // Validate content type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];

  if (!allowedTypes.includes(contentType)) {
    throw new ApiError(400, 'Unsupported file type');
  }

  const result = await storageService.generatePresignedUploadUrl(filename, contentType);
  res.status(200).json(result);
});

/**
 * @desc    Proxy upload to R2 to avoid CORS issues
 * @route   POST /api/uploads/proxy
 * @access  Private
 */
export const proxyUpload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { uploadUrl } = req.body;
  
  if (!uploadUrl) {
    throw new ApiError(400, 'Upload URL is required');
  }

  try {
    // Upload file to R2 using axios
    await axios.put(uploadUrl, req.file.buffer, {
      headers: {
        'Content-Type': req.file.mimetype
      }
    });

    res.status(200).json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error in proxy upload:', error);
    throw new ApiError(500, 'Failed to upload file to storage');
  }
});

/**
 * @desc    Delete a file from R2
 * @route   DELETE /api/uploads/:key
 * @access  Private
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  if (!key) {
    throw new ApiError(400, 'File key is required');
  }

  await storageService.deleteFile(key);
  res.status(200).json({ success: true, message: 'File deleted successfully' });
});

export default {
  getPresignedUrl,
  proxyUpload,
  deleteFile
}; 
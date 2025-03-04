"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.proxyUpload = exports.getPresignedUrl = exports.uploadMiddleware = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const storageService = __importStar(require("../services/storageService"));
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
// Configure multer for temporary file storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Middleware to handle file upload
exports.uploadMiddleware = upload.single('file');
/**
 * @desc    Generate a presigned URL for direct uploads
 * @route   POST /api/uploads/presigned
 * @access  Private
 */
exports.getPresignedUrl = (0, express_async_handler_1.default)(async (req, res) => {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
        throw new errorMiddleware_1.ApiError(400, 'Filename and content type are required');
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
        throw new errorMiddleware_1.ApiError(400, 'Unsupported file type');
    }
    const result = await storageService.generatePresignedUploadUrl(filename, contentType);
    res.status(200).json(result);
});
/**
 * @desc    Proxy upload to R2 to avoid CORS issues
 * @route   POST /api/uploads/proxy
 * @access  Private
 */
exports.proxyUpload = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new errorMiddleware_1.ApiError(400, 'No file uploaded');
    }
    const { uploadUrl } = req.body;
    if (!uploadUrl) {
        throw new errorMiddleware_1.ApiError(400, 'Upload URL is required');
    }
    try {
        // Upload file to R2 using axios
        await axios_1.default.put(uploadUrl, req.file.buffer, {
            headers: {
                'Content-Type': req.file.mimetype
            }
        });
        res.status(200).json({ success: true, message: 'File uploaded successfully' });
    }
    catch (error) {
        console.error('Error in proxy upload:', error);
        throw new errorMiddleware_1.ApiError(500, 'Failed to upload file to storage');
    }
});
/**
 * @desc    Delete a file from R2
 * @route   DELETE /api/uploads/:key
 * @access  Private
 */
exports.deleteFile = (0, express_async_handler_1.default)(async (req, res) => {
    const { key } = req.params;
    if (!key) {
        throw new errorMiddleware_1.ApiError(400, 'File key is required');
    }
    await storageService.deleteFile(key);
    res.status(200).json({ success: true, message: 'File deleted successfully' });
});
exports.default = {
    getPresignedUrl: exports.getPresignedUrl,
    proxyUpload: exports.proxyUpload,
    deleteFile: exports.deleteFile
};
//# sourceMappingURL=uploadController.js.map
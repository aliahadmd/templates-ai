"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicUrl = exports.deleteFile = exports.generatePresignedUploadUrl = void 0;
exports.configureBucketCors = configureBucketCors;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
// Initialize S3 client for Cloudflare R2
const s3Client = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
});
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || '';
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
/**
 * Configure CORS for the bucket
 */
async function configureBucketCors() {
    try {
        const corsParams = {
            Bucket: process.env.CLOUDFLARE_R2_BUCKET,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ['*'],
                        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                        AllowedOrigins: ['*'], // In production, you should restrict this to your domain
                        ExposeHeaders: ['ETag'],
                        MaxAgeSeconds: 3000,
                    },
                ],
            },
        };
        await s3Client.send(new client_s3_1.PutBucketCorsCommand(corsParams));
        console.log('CORS configuration applied to R2 bucket');
    }
    catch (error) {
        console.error('Error configuring CORS for R2 bucket:', error);
    }
}
/**
 * Generate a unique filename with original extension
 */
const generateUniqueFilename = (originalFilename) => {
    const timestamp = Date.now();
    const randomString = crypto_1.default.randomBytes(8).toString('hex');
    const extension = path_1.default.extname(originalFilename);
    const sanitizedName = path_1.default.basename(originalFilename, extension)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 20);
    return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
};
/**
 * Generate a presigned URL for direct upload
 */
const generatePresignedUploadUrl = async (originalFilename, contentType, folder = 'uploads') => {
    const filename = generateUniqueFilename(originalFilename);
    const key = folder ? `${folder}/${filename}` : filename;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `${publicUrl}/${key}`;
    return { uploadUrl, fileUrl, key };
};
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
/**
 * Delete a file from R2
 */
const deleteFile = async (key) => {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        await s3Client.send(command);
        return true;
    }
    catch (error) {
        console.error('Error deleting file from R2:', error);
        return false;
    }
};
exports.deleteFile = deleteFile;
/**
 * Get public URL for a file
 */
const getPublicUrl = (key) => {
    return `${publicUrl}/${key}`;
};
exports.getPublicUrl = getPublicUrl;
exports.default = {
    generatePresignedUploadUrl: exports.generatePresignedUploadUrl,
    deleteFile: exports.deleteFile,
    getPublicUrl: exports.getPublicUrl,
};
//# sourceMappingURL=storageService.js.map
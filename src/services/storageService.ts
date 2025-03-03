import { S3Client, PutObjectCommand, DeleteObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
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
export async function configureBucketCors() {
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

    await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log('CORS configuration applied to R2 bucket');
  } catch (error) {
    console.error('Error configuring CORS for R2 bucket:', error);
  }
}

/**
 * Generate a unique filename with original extension
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalFilename);
  const sanitizedName = path.basename(originalFilename, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20);
  
  return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Generate a presigned URL for direct upload
 */
export const generatePresignedUploadUrl = async (
  originalFilename: string,
  contentType: string,
  folder = 'uploads'
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> => {
  const filename = generateUniqueFilename(originalFilename);
  const key = folder ? `${folder}/${filename}` : filename;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `${publicUrl}/${key}`;
  
  return { uploadUrl, fileUrl, key };
};

/**
 * Delete a file from R2
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (key: string): string => {
  return `${publicUrl}/${key}`;
};

export default {
  generatePresignedUploadUrl,
  deleteFile,
  getPublicUrl,
}; 
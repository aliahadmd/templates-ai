/**
 * Configure CORS for the bucket
 */
export declare function configureBucketCors(): Promise<void>;
/**
 * Generate a presigned URL for direct upload
 */
export declare const generatePresignedUploadUrl: (originalFilename: string, contentType: string, folder?: string) => Promise<{
    uploadUrl: string;
    fileUrl: string;
    key: string;
}>;
/**
 * Delete a file from R2
 */
export declare const deleteFile: (key: string) => Promise<boolean>;
/**
 * Get public URL for a file
 */
export declare const getPublicUrl: (key: string) => string;
declare const _default: {
    generatePresignedUploadUrl: (originalFilename: string, contentType: string, folder?: string) => Promise<{
        uploadUrl: string;
        fileUrl: string;
        key: string;
    }>;
    deleteFile: (key: string) => Promise<boolean>;
    getPublicUrl: (key: string) => string;
};
export default _default;

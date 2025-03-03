import { useAuthStore } from '../stores/auth';

/**
 * Get a presigned URL for uploading a file directly to Cloudflare R2
 * @param filename The name of the file to upload
 * @param contentType The MIME type of the file
 * @param folder Optional folder path to store the file in
 * @returns Object containing the upload URL, file URL, and key
 */
export async function getPresignedUrl(filename: string, contentType: string, folder?: string): Promise<{
  uploadUrl: string;
  fileUrl: string;
  key: string;
}> {
  const authStore = useAuthStore();
  
  // Add folder prefix to filename if provided
  const filePathWithFolder = folder ? `${folder}/${filename}` : filename;
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/presigned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      filename: filePathWithFolder,
      contentType
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get presigned URL');
  }

  return await response.json();
}

/**
 * Upload a file directly to Cloudflare R2 using a presigned URL
 * @param file The file to upload
 * @param uploadUrl The presigned URL to upload to
 * @returns Promise that resolves when the upload is complete
 */
export async function uploadFileToR2(file: File, uploadUrl: string): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to storage');
    }
  } catch (error) {
    console.error('Direct upload failed, trying proxy upload:', error);
    // If direct upload fails (likely due to CORS), try proxy upload through backend
    await uploadFileViaProxy(file, uploadUrl);
  }
}

/**
 * Upload a file through the backend as a proxy to avoid CORS issues
 * @param file The file to upload
 * @param uploadUrl The presigned URL to upload to
 */
async function uploadFileViaProxy(file: File, uploadUrl: string): Promise<void> {
  const authStore = useAuthStore();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadUrl', uploadUrl);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authStore.token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file via proxy');
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param key The key of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteFile(key: string): Promise<void> {
  const authStore = useAuthStore();
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authStore.token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }
}

/**
 * Upload a file to Cloudflare R2 (combines getting a presigned URL and uploading)
 * @param file The file to upload
 * @param folder Optional folder path to store the file in
 * @returns Object containing the file URL and key
 */
export async function uploadFile(file: File, folder?: string): Promise<{
  fileUrl: string;
  key: string;
}> {
  // Get a presigned URL for the file
  const { uploadUrl, fileUrl, key } = await getPresignedUrl(file.name, file.type, folder);
  
  // Upload the file to R2
  await uploadFileToR2(file, uploadUrl);
  
  // Return the file URL and key
  return { fileUrl, key };
} 
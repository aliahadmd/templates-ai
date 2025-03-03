# Media Upload System Guide

This guide provides detailed information about the media upload system implemented in this project, which uses Cloudflare R2 for storage.

## Overview

The media upload system allows users to upload files directly to Cloudflare R2 storage using presigned URLs. This approach offers several advantages:

- **Reduced server load**: Files are uploaded directly from the client to R2
- **Better performance**: No need to proxy large files through the server
- **Scalability**: Can handle many concurrent uploads

The system includes a fallback mechanism that uploads through the server if direct uploads fail due to CORS issues.

## Architecture

### Backend Components

1. **Storage Service** (`src/services/storageService.ts`)
   - Handles interactions with Cloudflare R2 using AWS SDK
   - Generates presigned URLs for direct uploads
   - Configures CORS for the R2 bucket
   - Provides methods for file deletion and URL generation

2. **Upload Controller** (`src/controllers/uploadController.ts`)
   - Exposes API endpoints for generating presigned URLs
   - Provides a proxy upload endpoint for CORS fallback
   - Handles file deletion requests

3. **Upload Routes** (`src/routes/uploadRoutes.ts`)
   - Defines API routes for the upload functionality
   - Applies authentication middleware to protect routes

### Frontend Components

1. **Upload Service** (`frontend/src/utils/uploadService.ts`)
   - Provides methods for interacting with the upload API
   - Handles direct uploads to R2 using presigned URLs
   - Implements fallback to proxy uploads when direct uploads fail

2. **File Upload Component** (`frontend/src/components/ui/FileUpload.vue`)
   - Reusable Vue component for file uploads
   - Supports single and multiple file uploads
   - Provides drag-and-drop functionality
   - Shows upload progress and handles errors
   - Validates files based on type, size, and count

3. **Example Page** (`frontend/src/views/examples/FileUploadExample.vue`)
   - Demonstrates how to use the FileUpload component
   - Shows examples of single and multiple file uploads
   - Displays uploaded files with previews

## How It Works

### Direct Upload Flow

1. The client selects files to upload
2. The frontend requests a presigned URL from the backend
3. The backend generates a presigned URL with the AWS SDK
4. The frontend uploads the file directly to R2 using the presigned URL
5. Upon successful upload, the file URL and key are returned

### Fallback Upload Flow (CORS Issues)

1. If direct upload fails due to CORS issues
2. The frontend falls back to sending the file to the backend
3. The backend uploads the file to R2 on behalf of the client
4. The file URL and key are returned to the frontend

## CORS Configuration

The system automatically configures CORS for the R2 bucket on server startup with the following settings:

- Allowed origins: `*` (in production, you should restrict this)
- Allowed methods: GET, PUT, POST, DELETE, HEAD
- Allowed headers: `*`
- Exposed headers: ETag
- Max age: 3000 seconds

## Usage Examples

### Basic Usage

```vue
<template>
  <FileUpload
    v-model="uploadedFile"
    accept="image/*"
    :multiple="false"
    folder="profile-pictures"
    @success="handleUploadSuccess"
    @error="handleUploadError"
  />
</template>

<script setup>
import { ref } from 'vue';
import FileUpload from '@/components/ui/FileUpload.vue';

const uploadedFile = ref(null);

const handleUploadSuccess = (file) => {
  console.log('File uploaded successfully:', file);
};

const handleUploadError = (error) => {
  console.error('Upload error:', error);
};
</script>
```

### Multiple File Upload

```vue
<template>
  <FileUpload
    v-model="uploadedFiles"
    accept="image/*,application/pdf"
    :multiple="true"
    :maxFiles="5"
    folder="documents"
    @success="handleUploadSuccess"
    @error="handleUploadError"
  />
  
  <div v-if="uploadedFiles.length" class="uploaded-files">
    <div v-for="file in uploadedFiles" :key="file.key" class="file-item">
      <img v-if="file.type.startsWith('image/')" :src="file.url" alt="Preview" />
      <a :href="file.url" target="_blank">{{ file.name }}</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileUpload from '@/components/ui/FileUpload.vue';

const uploadedFiles = ref([]);

const handleUploadSuccess = (files) => {
  console.log('Files uploaded successfully:', files);
};

const handleUploadError = (error) => {
  console.error('Upload error:', error);
};
</script>
```

### Programmatic Upload

You can also use the upload service directly for more control:

```typescript
import { uploadFile, deleteFile } from '@/utils/uploadService';

// Upload a file
async function uploadProfilePicture(file) {
  try {
    const { fileUrl, key } = await uploadFile(file, 'profile-pictures');
    console.log('File uploaded:', fileUrl);
    return { fileUrl, key };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Delete a file
async function removeProfilePicture(key) {
  try {
    await deleteFile(key);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Deletion failed:', error);
    throw error;
  }
}
```

## Configuration

### Backend Environment Variables

```
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_BUCKET="your-bucket-name"
CLOUDFLARE_R2_PUBLIC_URL="https://your-public-url.example.com"
```

### Frontend Environment Variables

```
VITE_API_URL="http://localhost:3000"
```

## Customization

### Allowed File Types

You can customize the allowed file types in the upload controller:

```typescript
// src/controllers/uploadController.ts
const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  // Add more types as needed
];
```

### File Size Limits

File size limits can be adjusted in both the backend and frontend:

```typescript
// Backend (src/controllers/uploadController.ts)
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Frontend (FileUpload.vue props)
const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  }
});
```

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Ensure the R2 bucket has proper CORS configuration
2. Check that the `configureBucketCors` function is called on server startup
3. Verify that the frontend is using the correct API URL
4. Try using the proxy upload fallback mechanism

### Upload Failures

If uploads are failing:

1. Check browser console for specific error messages
2. Verify that the R2 credentials are correct
3. Ensure the file size and type are allowed
4. Check network requests to see where the failure occurs

## Security Considerations

- All upload routes are protected with authentication middleware
- File types are validated on both frontend and backend
- File sizes are limited to prevent abuse
- In production, restrict CORS to specific origins
- Consider implementing rate limiting for upload endpoints

## Performance Optimization

- Use direct uploads whenever possible
- Implement client-side image compression for large images
- Consider using a CDN in front of R2 for better delivery performance
- Implement chunked uploads for very large files 
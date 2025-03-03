<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">File Upload Example</h1>
      </div>
      <div class="page-content">
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg leading-6 font-medium text-foreground">Single File Upload</h3>
            <p class="form-hint">Upload a single image file</p>
          </div>
          <div class="card-body">
            <FileUpload
              v-model:value="singleFile"
              accept="image/*"
              :multiple="false"
              folder="profile-images"
              @upload-success="handleSingleUploadSuccess"
              @upload-error="handleUploadError"
            />
            
            <div v-if="singleFile.length > 0" class="mt-4">
              <h4 class="font-medium mb-2">Uploaded File:</h4>
              <div class="p-4 bg-muted rounded-md">
                <div v-if="singleFile[0].type.startsWith('image/')" class="mb-2">
                  <img :src="singleFile[0].url" alt="Uploaded image" class="max-h-40 rounded-md" />
                </div>
                <div class="text-sm">
                  <p><strong>Name:</strong> {{ singleFile[0].name }}</p>
                  <p><strong>URL:</strong> <a :href="singleFile[0].url" target="_blank" class="text-primary">{{ singleFile[0].url }}</a></p>
                  <p><strong>Size:</strong> {{ formatFileSize(singleFile[0].size) }}</p>
                  <p><strong>Type:</strong> {{ singleFile[0].type }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg leading-6 font-medium text-foreground">Multiple File Upload</h3>
            <p class="form-hint">Upload multiple files (images, PDFs, documents)</p>
          </div>
          <div class="card-body">
            <FileUpload
              v-model:value="multipleFiles"
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              :multiple="true"
              :maxFiles="5"
              folder="documents"
              @upload-success="handleMultipleUploadSuccess"
              @upload-error="handleUploadError"
            />
            
            <div v-if="multipleFiles.length > 0" class="mt-4">
              <h4 class="font-medium mb-2">Uploaded Files:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="(file, index) in multipleFiles" 
                  :key="index" 
                  class="p-4 bg-muted rounded-md"
                >
                  <div v-if="file.type.startsWith('image/')" class="mb-2">
                    <img :src="file.url" alt="Uploaded image" class="max-h-32 rounded-md" />
                  </div>
                  <div v-else class="mb-2 text-center py-4">
                    <i :class="getFileIcon(file.type)" class="text-4xl"></i>
                  </div>
                  <div class="text-sm">
                    <p class="font-medium truncate">{{ file.name }}</p>
                    <p class="text-muted-foreground">{{ formatFileSize(file.size) }}</p>
                    <div class="flex justify-between mt-2">
                      <a :href="file.url" target="_blank" class="text-primary text-sm">View</a>
                      <button 
                        @click="removeFile(index)" 
                        class="text-error text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppLayout from '../../components/layout/AppLayout.vue';
import FileUpload from '../../components/ui/FileUpload.vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const API_URL = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();

// State
const singleFile = ref<any[]>([]);
const multipleFiles = ref<any[]>([]);

// Event handlers
const handleSingleUploadSuccess = (files: any[]) => {
  console.log('Single file uploaded successfully:', files);
};

const handleMultipleUploadSuccess = (files: any[]) => {
  console.log('Multiple files uploaded successfully:', files);
};

const handleUploadError = (error: string) => {
  console.error('Upload error:', error);
};

// Remove a file from the multiple files list and delete it from R2
const removeFile = async (index: number) => {
  try {
    const file = multipleFiles.value[index];
    
    // Delete file from R2
    await axios.delete(`${API_URL}/api/uploads/${encodeURIComponent(file.key)}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    // Remove from local state
    multipleFiles.value.splice(index, 1);
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'fas fa-file-image text-blue-500';
  if (fileType.startsWith('video/')) return 'fas fa-file-video text-purple-500';
  if (fileType.startsWith('audio/')) return 'fas fa-file-audio text-yellow-500';
  if (fileType === 'application/pdf') return 'fas fa-file-pdf text-red-500';
  if (fileType.includes('word')) return 'fas fa-file-word text-blue-700';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel text-green-600';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint text-orange-500';
  return 'fas fa-file text-gray-500';
};
</script> 
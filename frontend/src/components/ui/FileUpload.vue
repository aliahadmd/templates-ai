<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      :class="{ 
        'upload-area-dragging': isDragging, 
        'upload-area-error': error,
        'upload-area-disabled': disabled
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileChange"
        :disabled="disabled"
      />
      
      <div v-if="!files.length && !uploading" class="upload-placeholder">
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt text-3xl"></i>
        </div>
        <p class="upload-text">
          <span class="font-medium">Click to upload</span> or drag and drop
        </p>
        <p class="upload-hint">
          {{ hint || `${acceptedFileTypes} (max ${formatFileSize(maxFileSize)})` }}
        </p>
      </div>
      
      <div v-else-if="uploading" class="upload-loading">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2">Uploading...</p>
      </div>
      
      <div v-else class="upload-files">
        <div v-for="(file, index) in files" :key="index" class="upload-file">
          <div class="upload-file-icon">
            <i :class="getFileIcon(file.type)"></i>
          </div>
          <div class="upload-file-info">
            <p class="upload-file-name">{{ file.name }}</p>
            <p class="upload-file-size">{{ formatFileSize(file.size) }}</p>
          </div>
          <button 
            v-if="!disabled" 
            @click.stop="removeFile(index)" 
            class="upload-file-remove"
            type="button"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div v-if="error" class="upload-error">
        {{ error }}
      </div>
    </div>
    
    <div v-if="files.length && !disabled && !uploading" class="upload-actions">
      <Button 
        @click="uploadFiles" 
        :loading="uploading"
        :disabled="uploading || files.length === 0"
      >
        Upload {{ files.length }} {{ files.length === 1 ? 'file' : 'files' }}
      </Button>
      <Button 
        @click="clearFiles" 
        variant="outline" 
        :disabled="uploading || files.length === 0"
      >
        Clear
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from './Button.vue';
import { uploadFile } from '../../utils/uploadService';



const props = defineProps({
  accept: {
    type: String,
    default: 'image/*,application/pdf'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  maxFiles: {
    type: Number,
    default: 5
  },
  folder: {
    type: String,
    default: 'uploads'
  },
  hint: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  value: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:value', 'upload-success', 'upload-error', 'file-removed']);

// Define a file type with additional properties for tracking upload status
interface UploadFile extends File {
  status?: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  url?: string;
  key?: string;
}

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref<UploadFile[]>([]);
const uploadedFiles = ref<any[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const error = ref('');

// Initialize with existing files if provided
watch(() => props.value, (newValue) => {
  if (newValue && newValue.length) {
    uploadedFiles.value = [...newValue];
  }
}, { immediate: true });

// Computed properties
const acceptedFileTypes = computed(() => {
  return props.accept.split(',').map(type => {
    return type.replace('*', '').replace('/', '').toUpperCase();
  }).join(', ');
});

// Methods
const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click();
  }
};

const handleDragOver = (_e: DragEvent) => {
  if (props.disabled) return;
  isDragging.value = true;
};

const handleDragLeave = (_e: DragEvent) => {
  isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
  if (props.disabled) return;
  isDragging.value = false;
  
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files);
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    handleFiles(target.files);
  }
};

const handleFiles = (fileList: FileList) => {
  error.value = '';
  
  // Check if adding these files would exceed the max files limit
  if (props.multiple && files.value.length + fileList.length > props.maxFiles) {
    error.value = `You can only upload a maximum of ${props.maxFiles} files`;
    return;
  }
  
  // Convert FileList to array and validate each file
  const newFiles = Array.from(fileList).filter(file => {
    // Check file size
    if (file.size > props.maxFileSize) {
      error.value = `File ${file.name} exceeds the maximum file size of ${formatFileSize(props.maxFileSize)}`;
      return false;
    }
    
    // Check file type
    if (props.accept !== '*' && !isAcceptedFileType(file)) {
      error.value = `File ${file.name} has an unsupported file type`;
      return false;
    }
    
    return true;
  }).map(file => {
    // Add status property to each file
    return Object.assign(file, {
      status: 'pending',
      progress: 0
    }) as UploadFile;
  });
  
  if (newFiles.length) {
    if (props.multiple) {
      files.value = [...files.value, ...newFiles];
    } else {
      files.value = [newFiles[0]];
    }
  }
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const isAcceptedFileType = (file: File) => {
  const acceptTypes = props.accept.split(',').map(type => type.trim());
  
  return acceptTypes.some(type => {
    if (type === '*') return true;
    if (type.endsWith('/*')) {
      const mainType = type.replace('/*', '');
      return file.type.startsWith(mainType);
    }
    return file.type === type;
  });
};

const removeFile = (index: number) => {
  const removedFile = files.value.splice(index, 1)[0];
  emit('file-removed', removedFile);
};

const clearFiles = () => {
  files.value = [];
};

const uploadFiles = async () => {
  if (files.value.length === 0) return;
  
  uploading.value = true;
  error.value = '';
  
  try {
    const uploadedResults = [];
    
    for (const file of files.value) {
      if (file.status === 'error') continue;
      
      file.status = 'uploading';
      file.progress = 0;
      
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          if (file.progress && file.progress < 90) {
            file.progress += 10;
          }
        }, 300);
        
        // Upload the file
        const { fileUrl, key } = await uploadFile(file, props.folder);
        
        clearInterval(progressInterval);
        file.progress = 100;
        file.status = 'success';
        file.url = fileUrl;
        file.key = key;
        
        uploadedResults.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          key: key
        });
      } catch (err: any) {
        console.error('Upload error:', err);
        file.status = 'error';
        file.error = err.message || 'Upload failed';
      }
    }
    
    if (uploadedResults.length > 0) {
      if (props.multiple) {
        emit('update:value', [...(props.value || []), ...uploadedResults]);
        emit('upload-success', uploadedResults);
      } else {
        emit('update:value', uploadedResults[0]);
        emit('upload-success', uploadedResults[0]);
      }
    } else {
      throw new Error('No files were uploaded successfully');
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    error.value = err.message || 'Failed to upload files';
    emit('upload-error', error.value);
  } finally {
    uploading.value = false;
  }
};

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

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-background);
}

.upload-area-dragging {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.upload-area-error {
  border-color: var(--color-error);
}

.upload-area-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  color: var(--color-muted-foreground);
  margin-bottom: 0.5rem;
}

.upload-text {
  color: var(--color-foreground);
  margin-bottom: 0.25rem;
}

.upload-hint {
  color: var(--color-muted-foreground);
  font-size: 0.875rem;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-muted-foreground);
}

.upload-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.upload-file {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--color-muted);
  text-align: left;
}

.upload-file-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.upload-file-info {
  flex: 1;
}

.upload-file-name {
  font-weight: 500;
  color: var(--color-foreground);
  word-break: break-all;
}

.upload-file-size {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}

.upload-file-remove {
  color: var(--color-muted-foreground);
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.upload-file-remove:hover {
  color: var(--color-error);
  background-color: var(--color-muted-foreground-light);
}

.upload-error {
  color: var(--color-error);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.hidden {
  display: none;
}
</style> 
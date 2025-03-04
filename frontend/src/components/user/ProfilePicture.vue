<template>
  <div class="profile-picture-container">
    <div class="profile-picture-wrapper">
      <!-- Profile picture display -->
      <div 
        class="profile-picture" 
        :class="{ 'has-image': profileImageUrl }"
        @click="openFileSelector"
      >
        <img 
          v-if="profileImageUrl" 
          :src="profileImageUrl" 
          alt="Profile Picture" 
          class="profile-image"
        />
        <div v-else class="profile-initials">
          {{ userInitials }}
        </div>
        
        <!-- Overlay with edit icon -->
        <div class="profile-picture-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      
      <!-- Loading spinner -->
      <div v-if="isUploading" class="upload-spinner">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
    
    <!-- Hidden file input -->
    <input 
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
    
    <!-- Profile picture actions -->
    <div class="profile-picture-actions">
      <button 
        v-if="profileImageUrl" 
        @click="removeProfilePicture" 
        type="button"
        class="text-sm text-destructive hover:underline"
      >
        Remove photo
      </button>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="text-destructive text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { uploadFile, deleteFile } from '../../utils/uploadService';
import axios from 'axios';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error']);

const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null);
const profileImageUrl = ref(props.modelValue || '');
const profileImageKey = ref('');
const isUploading = ref(false);
const error = ref('');

// Compute user initials from first and last name
const userInitials = computed(() => {
  if (!authStore.user) return '';
  
  const firstName = authStore.user.firstName || '';
  const lastName = authStore.user.lastName || '';
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
});

// Initialize profile picture if user has one
onMounted(async () => {
  if (authStore.user?.profilePicture) {
    profileImageUrl.value = authStore.user.profilePicture;
  }
});

// Open file selector when clicking on profile picture
const openFileSelector = () => {
  fileInput.value?.click();
};

// Handle file selection
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file';
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image size should not exceed 5MB';
    return;
  }
  
  try {
    isUploading.value = true;
    error.value = '';
    
    // Upload file to R2
    const { fileUrl, key } = await uploadFile(file, 'profile-pictures');
    
    try {
      // Update profile picture in user profile
      await updateUserProfile({ profilePicture: fileUrl, profilePictureKey: key });
      
      // Update local state
      profileImageUrl.value = fileUrl;
      profileImageKey.value = key;
      
      // Emit events
      emit('update:modelValue', fileUrl);
      emit('upload-success', { url: fileUrl, key });
    } catch (profileErr: any) {
      // If updating profile fails, try to delete the uploaded file
      console.error('Error updating profile, cleaning up uploaded file:', profileErr);
      try {
        await deleteFile(key);
      } catch (deleteErr) {
        console.error('Error cleaning up file after profile update failure:', deleteErr);
      }
      throw profileErr; // Re-throw the original error
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (err: any) {
    console.error('Profile picture upload error:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to upload profile picture';
    emit('upload-error', error.value);
  } finally {
    isUploading.value = false;
  }
};

// Update user profile with new profile picture
const updateUserProfile = async (profileData: { profilePicture: string, profilePictureKey: string }) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/users/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );
    
    // Refresh user data
    await authStore.fetchUser();
    
    return response.data;
  } catch (err: any) {
    console.error('Error updating profile with new picture:', err);
    throw new Error(err.response?.data?.message || 'Failed to update profile');
  }
};

// Remove profile picture
const removeProfilePicture = async () => {
  try {
    isUploading.value = true;
    error.value = '';
    
    const keyToDelete = profileImageKey.value || authStore.user?.profilePictureKey;
    
    // Update profile to remove profile picture first
    await updateUserProfile({ profilePicture: '', profilePictureKey: '' });
    
    // Then delete the file from R2 if we have a key
    if (keyToDelete) {
      try {
        await deleteFile(keyToDelete);
      } catch (deleteErr) {
        console.error('Error deleting file from storage, but profile was updated:', deleteErr);
        // Continue even if file deletion fails, as the profile was updated
      }
    }
    
    // Update local state
    profileImageUrl.value = '';
    profileImageKey.value = '';
    
    // Emit events
    emit('update:modelValue', '');
    
  } catch (err: any) {
    console.error('Error removing profile picture:', err);
    error.value = err.message || 'Failed to remove profile picture';
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.profile-picture-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-picture-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
}

.profile-picture {
  width: 128px;
  height: 128px;
  border-radius: 9999px;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 4px solid var(--color-card);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.profile-picture.has-image {
  background-color: var(--color-card);
}

.profile-initials {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--color-primary-foreground);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.profile-picture:hover .profile-picture-overlay {
  opacity: 1;
}

.upload-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.profile-picture-actions {
  display: flex;
  justify-content: center;
}

.hidden {
  display: none;
}
</style> 
<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Profile</h1>
      </div>
      <div class="page-content">
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg leading-6 font-medium text-foreground">Profile Information</h3>
            <p class="form-hint">Update your personal information.</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile" class="form-container">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <Input
                    v-model="firstName"
                    label="First Name"
                    type="text"
                    placeholder="Enter your first name"
                    :error="errors.firstName"
                    required
                  />
                </div>
                <div class="sm:col-span-3">
                  <Input
                    v-model="lastName"
                    label="Last Name"
                    type="text"
                    placeholder="Enter your last name"
                    :error="errors.lastName"
                    required
                  />
                </div>
                <div class="sm:col-span-6">
                  <Input
                    v-model="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    :error="errors.email"
                    required
                  />
                </div>
              </div>
              <div class="flex justify-end">
                <Button type="submit" :loading="loading">Update Profile</Button>
              </div>
              <div v-if="updateSuccess" class="text-success text-sm text-center">
                Profile updated successfully!
              </div>
              <div v-if="error" class="form-error text-center">{{ error }}</div>
            </form>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg leading-6 font-medium text-foreground">Change Password</h3>
            <p class="form-hint">Update your password.</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword" class="form-container">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-6">
                  <Input
                    v-model="currentPassword"
                    label="Current Password"
                    type="password"
                    placeholder="Enter your current password"
                    :error="passwordErrors.currentPassword"
                    required
                  />
                </div>
                <div class="sm:col-span-6">
                  <Input
                    v-model="newPassword"
                    label="New Password"
                    type="password"
                    placeholder="Enter your new password"
                    :error="passwordErrors.newPassword"
                    required
                    hint="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                  />
                </div>
                <div class="sm:col-span-6">
                  <Input
                    v-model="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your new password"
                    :error="passwordErrors.confirmPassword"
                    required
                  />
                </div>
              </div>
              <div class="flex justify-end">
                <Button type="submit" :loading="passwordLoading">Change Password</Button>
              </div>
              <div v-if="passwordSuccess" class="text-success text-sm text-center">
                Password changed successfully!
              </div>
              <div v-if="passwordError" class="form-error text-center">{{ passwordError }}</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import AppLayout from '../../components/layout/AppLayout.vue';
import Input from '../../components/ui/Input.vue';
import Button from '../../components/ui/Button.vue';
import { z } from 'zod';
import axios from 'axios';

const authStore = useAuthStore();

// Profile update
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const errors = ref<Record<string, string>>({});
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);
const updateSuccess = ref(false);

// Password change
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordErrors = ref<Record<string, string>>({});
const passwordLoading = ref(false);
const passwordError = ref('');
const passwordSuccess = ref(false);

onMounted(async () => {
  try {
    await authStore.fetchUser();
    if (authStore.user) {
      firstName.value = authStore.user.firstName || '';
      lastName.value = authStore.user.lastName || '';
      email.value = authStore.user.email;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

// Profile update validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
});

const validateProfile = () => {
  errors.value = {};
  try {
    profileSchema.parse({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value
    });
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach((e) => {
        if (e.path.length > 0) {
          errors.value[e.path[0]] = e.message;
        }
      });
    }
    return false;
  }
};

const updateProfile = async () => {
  if (!validateProfile()) return;
  updateSuccess.value = false;

  try {
    await authStore.fetchUser(); // Refresh user data first
    
    // Only update if values have changed
    const userData: Record<string, string> = {};
    if (firstName.value !== authStore.user?.firstName) {
      userData.firstName = firstName.value;
    }
    if (lastName.value !== authStore.user?.lastName) {
      userData.lastName = lastName.value;
    }
    if (email.value !== authStore.user?.email) {
      userData.email = email.value;
    }

    if (Object.keys(userData).length > 0) {
      // Use axios with proper error handling
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });

      await authStore.fetchUser(); // Refresh user data
      updateSuccess.value = true;
    } else {
      updateSuccess.value = true; // No changes needed
    }
  } catch (err: any) {
    console.error('Profile update error:', err);
  }
};

// Password change validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const validatePassword = () => {
  passwordErrors.value = {};
  try {
    passwordSchema.parse({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    });
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach((e) => {
        if (e.path.length > 0) {
          passwordErrors.value[e.path[0]] = e.message;
        }
      });
    }
    return false;
  }
};

const changePassword = async () => {
  if (!validatePassword()) return;
  passwordLoading.value = true;
  passwordError.value = '';
  passwordSuccess.value = false;

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value);
    passwordSuccess.value = true;
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: any) {
    passwordError.value = err.response?.data?.message || 'Failed to change password';
    console.error('Password change error:', err);
  } finally {
    passwordLoading.value = false;
  }
};
</script> 
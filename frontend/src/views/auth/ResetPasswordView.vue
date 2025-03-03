<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-muted-foreground">
        Enter your new password below.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <form v-if="!successMessage" @submit.prevent="handleSubmit" class="form-container">
            <div>
              <Input
                v-model="password"
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                :error="errors.password"
                required
                hint="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
              />
            </div>
            <div>
              <Input
                v-model="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your new password"
                :error="errors.confirmPassword"
                required
              />
            </div>
            <div>
              <Button type="submit" :loading="loading" class="w-full">Reset Password</Button>
            </div>
            <div v-if="error" class="form-error text-center">{{ error }}</div>
          </form>
          <div v-else class="space-y-6">
            <div class="text-success text-sm text-center">{{ successMessage }}</div>
            <div class="text-center">
              <Button @click="redirectToLogin" class="w-full">Go to Login</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Input from '../../components/ui/Input.vue';
import Button from '../../components/ui/Button.vue';
import { z } from 'zod';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const errors = ref<Record<string, string>>({});
const successMessage = ref('');
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

onMounted(() => {
  token.value = route.query.token as string;
  if (!token.value) {
    errors.value.token = 'Reset token is missing';
  }
});

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const validate = () => {
  errors.value = {};
  try {
    resetPasswordSchema.parse({
      token: token.value,
      password: password.value,
      confirmPassword: confirmPassword.value
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

const handleSubmit = async () => {
  if (!validate()) return;

  try {
    await authStore.resetPassword(token.value, password.value);
    successMessage.value = 'Your password has been reset successfully.';
  } catch (err) {
    // Error is handled in the store
    console.error('Reset password error:', err);
  }
};

const redirectToLogin = () => {
  router.push('/login');
};
</script> 
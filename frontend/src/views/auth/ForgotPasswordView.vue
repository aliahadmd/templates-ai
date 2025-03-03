<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Forgot your password?
      </h2>
      <p class="mt-2 text-center text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="handleSubmit" class="form-container">
            <div>
              <Input
                v-model="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                :error="errors.email"
                required
              />
            </div>
            <div>
              <Button type="submit" :loading="loading" class="w-full">Send reset link</Button>
            </div>
            <div v-if="error" class="form-error text-center">{{ error }}</div>
            <div v-if="successMessage" class="text-success text-sm text-center">{{ successMessage }}</div>
            <div class="text-center text-sm">
              <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
                Back to login
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Input from '../../components/ui/Input.vue';
import Button from '../../components/ui/Button.vue';
import { z } from 'zod';

const authStore = useAuthStore();

const email = ref('');
const errors = ref<Record<string, string>>({});
const successMessage = ref('');
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const validate = () => {
  errors.value = {};
  try {
    forgotPasswordSchema.parse({
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

const handleSubmit = async () => {
  if (!validate()) return;
  successMessage.value = '';

  try {
    await authStore.forgotPassword(email.value);
    successMessage.value = 'Password reset link has been sent to your email.';
    email.value = '';
  } catch (err) {
    // Error is handled in the store
    console.error('Forgot password error:', err);
  }
};
</script> 
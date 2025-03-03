<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Verify your email
      </h2>
      <p class="mt-2 text-center text-sm text-muted-foreground">
        {{ message }}
      </p>
    </div>

    <div v-if="showVerificationForm" class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="handleSubmit" class="form-container">
            <div>
              <Input
                v-model="verificationToken"
                label="Verification Token"
                type="text"
                placeholder="Enter your verification token"
                :error="errors.token"
                required
                hint="Enter the token from the verification email"
              />
            </div>
            <div>
              <Button type="submit" :loading="loading" class="w-full">Verify Email</Button>
            </div>
            <div v-if="error" class="form-error text-center">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <div class="text-success text-sm text-center mb-4">{{ successMessage }}</div>
          <div class="text-center">
            <Button @click="redirectToLogin" class="w-full">Go to Login</Button>
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

const verificationToken = ref('');
const errors = ref<Record<string, string>>({});
const successMessage = ref('');
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);
const showVerificationForm = ref(true);
const message = ref('Please check your email for a verification link or enter the verification token below.');

onMounted(() => {
  // Check if token is in the URL
  const token = route.query.token as string;
  if (token) {
    verificationToken.value = token;
    handleSubmit();
  }
});

// Validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

const validate = () => {
  errors.value = {};
  try {
    verifyEmailSchema.parse({
      token: verificationToken.value
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
    await authStore.verifyEmail(verificationToken.value);
    successMessage.value = 'Your email has been verified successfully.';
    showVerificationForm.value = false;
  } catch (err) {
    // Error is handled in the store
    console.error('Email verification error:', err);
  }
};

const redirectToLogin = () => {
  router.push('/login');
};
</script> 
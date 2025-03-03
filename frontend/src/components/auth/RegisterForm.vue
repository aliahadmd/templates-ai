<template>
  <form @submit.prevent="handleSubmit" class="form-container">
    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
      <div>
        <Input
          v-model="firstName"
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          :error="errors.firstName"
          required
        />
      </div>
      <div>
        <Input
          v-model="lastName"
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          :error="errors.lastName"
          required
        />
      </div>
    </div>
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
      <Input
        v-model="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
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
        placeholder="Confirm your password"
        :error="errors.confirmPassword"
        required
      />
    </div>
    <div>
      <Button type="submit" :loading="loading" class="w-full">Sign up</Button>
    </div>
    <div v-if="error" class="form-error text-center">{{ error }}</div>
    <div class="text-center text-sm text-muted-foreground">
      Already have an account?
      <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
        Sign in
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import { z } from 'zod';

const router = useRouter();
const authStore = useAuthStore();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errors = ref<Record<string, string>>({});
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
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
    registerSchema.parse({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
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
    await authStore.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value
    });

    // Show success message and redirect to login or verification page
    router.push('/verify-email');
  } catch (err) {
    // Error is handled in the store
    console.error('Registration error:', err);
  }
};
</script> 
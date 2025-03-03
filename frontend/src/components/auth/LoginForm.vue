<template>
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
      <Input
        v-model="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        :error="errors.password"
        required
      />
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember-me"
          v-model="rememberMe"
          type="checkbox"
          class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label for="remember-me" class="ml-2 block text-sm text-foreground">Remember me</label>
      </div>
      <div class="text-sm">
        <router-link to="/forgot-password" class="font-medium text-primary hover:text-primary/80">
          Forgot your password?
        </router-link>
      </div>
    </div>
    <div>
      <Button type="submit" :loading="loading" class="w-full">Sign in</Button>
    </div>
    <div v-if="error" class="form-error text-center">{{ error }}</div>
    <div class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <router-link to="/register" class="font-medium text-primary hover:text-primary/80">
        Sign up
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import { z } from 'zod';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errors = ref<Record<string, string>>({});
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const validate = () => {
  errors.value = {};
  try {
    loginSchema.parse({
      email: email.value,
      password: password.value
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
    await authStore.login({
      email: email.value,
      password: password.value
    });

    // Redirect to the intended page or dashboard
    const redirectPath = (route.query.redirect as string) || '/dashboard';
    router.push(redirectPath);
  } catch (err) {
    // Error is handled in the store
    console.error('Login error:', err);
  }
};
</script> 
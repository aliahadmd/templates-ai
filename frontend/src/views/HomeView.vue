<template>
  <div class="relative isolate px-6 pt-14 lg:px-8">
    <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Secure Authentication System
        </h1>
        <p class="mt-6 text-lg leading-8 text-muted-foreground">
          A complete role-based authentication and authorization system built with TypeScript, Express.js, Prisma, Vue.js, and more.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <router-link
            v-if="!isAuthenticated"
            to="/register"
            class="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get started
          </router-link>
          <router-link
            v-if="isAuthenticated"
            to="/dashboard"
            class="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go to Dashboard
          </router-link>
          <a href="https://github.com/yourusername/auth-system" class="text-sm font-semibold leading-6 text-foreground">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script> 
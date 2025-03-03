<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
      </div>
      <div class="page-content">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg leading-6 font-medium text-foreground">User Information</h3>
            <p class="form-hint">Personal details and role information.</p>
          </div>
          <div class="card-body">
            <dl class="sm:divide-y sm:divide-border">
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-muted-foreground">Full name</dt>
                <dd class="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  {{ user?.firstName }} {{ user?.lastName }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-muted-foreground">Email address</dt>
                <dd class="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">{{ user?.email }}</dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-muted-foreground">Email verification</dt>
                <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span
                    :class="[
                      'badge',
                      user?.isEmailVerified ? 'badge-success' : 'badge-warning'
                    ]"
                  >
                    {{ user?.isEmailVerified ? 'Verified' : 'Not Verified' }}
                  </span>
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-muted-foreground">Role</dt>
                <dd class="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  <span
                    :class="[
                      'badge',
                      isAdmin ? 'bg-primary/20 text-primary' : 'badge-info'
                    ]"
                  >
                    {{ user?.role?.name }}
                  </span>
                </dd>
              </div>
              <div v-if="permissions.length > 0" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="text-sm font-medium text-muted-foreground">Permissions</dt>
                <dd class="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="permission in permissions"
                      :key="permission"
                      class="badge badge-neutral"
                    >
                      {{ permission }}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import AppLayout from '../components/layout/AppLayout.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
const permissions = computed(() => authStore.user?.permissions || []);

onMounted(async () => {
  try {
    await authStore.fetchUser();
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});
</script> 
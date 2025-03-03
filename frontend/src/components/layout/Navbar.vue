<template>
  <nav class="bg-card shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary">Auth System</router-link>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- Current: "border-primary text-foreground", Default: "border-transparent text-muted-foreground hover:border-muted hover:text-foreground" -->
            <router-link
              v-if="isAuthenticated"
              to="/dashboard"
              class="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-foreground"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="isAuthenticated && isAdmin"
              to="/users"
              class="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-foreground"
            >
              Users
            </router-link>
            <router-link
              v-if="isAuthenticated && isAdmin"
              to="/roles"
              class="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-foreground"
            >
              Roles
            </router-link>
            <router-link
              v-if="isAuthenticated && isAdmin"
              to="/permissions"
              class="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-foreground"
            >
              Permissions
            </router-link>
            <router-link
              v-if="isAuthenticated"
              to="/examples/file-upload"
              class="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-foreground"
            >
              File Upload
            </router-link>
          </div>
        </div>
        <div class="hidden md:ml-4 md:flex md:items-center md:space-x-4">
          <ThemeToggle />
          <div v-if="isAuthenticated" class="relative ml-3">
            <div>
              <button
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex rounded-full bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {{ userInitials }}
                </div>
              </button>
            </div>
            
            <!-- Profile dropdown -->
            <div
              v-if="isProfileMenuOpen"
              class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              tabindex="-1"
            >
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-0"
              >
                Your Profile
              </router-link>
              <button
                @click="logout"
                class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
                role="menuitem"
                tabindex="-1"
                id="user-menu-item-1"
              >
                Sign out
              </button>
            </div>
          </div>
          <div v-else class="flex space-x-4">
            <router-link
              to="/login"
              class="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium"
            >
              Register
            </router-link>
          </div>
        </div>
        <div class="-mr-2 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-controls="mobile-menu"
            :aria-expanded="isMobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                v-if="isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div v-if="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          v-if="isAuthenticated"
          to="/dashboard"
          class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-primary/10 text-primary"
          @click="isMobileMenuOpen = false"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="isAuthenticated && isAdmin"
          to="/users"
          class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-primary/10 text-primary"
          @click="isMobileMenuOpen = false"
        >
          Users
        </router-link>
        <router-link
          v-if="isAuthenticated && isAdmin"
          to="/roles"
          class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-primary/10 text-primary"
          @click="isMobileMenuOpen = false"
        >
          Roles
        </router-link>
        <router-link
          v-if="isAuthenticated && isAdmin"
          to="/permissions"
          class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-primary/10 text-primary"
          @click="isMobileMenuOpen = false"
        >
          Permissions
        </router-link>
        <router-link
          v-if="isAuthenticated"
          to="/examples/file-upload"
          class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          @click="isMobileMenuOpen = false"
        >
          File Upload
        </router-link>
        <div v-if="!isAuthenticated" class="space-y-1">
          <router-link
            to="/login"
            class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
            @click="isMobileMenuOpen = false"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="text-muted-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
            @click="isMobileMenuOpen = false"
          >
            Register
          </router-link>
        </div>
      </div>
      <div v-if="isAuthenticated" class="pt-4 pb-3 border-t border-border">
        <div class="flex items-center px-4">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {{ userInitials }}
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-foreground">{{ userName }}</div>
            <div class="text-sm font-medium text-muted-foreground">{{ userEmail }}</div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <router-link
            to="/profile"
            class="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            @click="isMobileMenuOpen = false"
          >
            Your Profile
          </router-link>
          <a
            href="#"
            class="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            @click="logout"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import ThemeToggle from '../ui/ThemeToggle.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const userName = computed(() => {
  if (!authStore.user) return '';
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim();
});
const userEmail = computed(() => authStore.user?.email || '');
const userInitials = computed(() => {
  if (!authStore.user) return '';
  const firstName = authStore.user.firstName || '';
  const lastName = authStore.user.lastName || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
});

const isMobileMenuOpen = ref(false);
const isProfileMenuOpen = ref(false);

const logout = () => {
  authStore.logout();
  isProfileMenuOpen.value = false;
  isMobileMenuOpen.value = false;
};
</script> 
<template>
  <div class="flex items-center">
    <!-- Theme dropdown with dynamic icon -->
    <div class="relative ml-2">
      <button
        @click="isOpen = !isOpen"
        class="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
        :title="currentThemeTitle"
      >
        <!-- Light theme icon -->
        <svg
          v-if="!isSystemTheme && theme === 'light'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        
        <!-- Dark theme icon -->
        <svg
          v-else-if="!isSystemTheme && theme === 'dark'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        
        <!-- System theme icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
      
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <button
            @click="setTheme('light'); isOpen = false"
            class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
            role="menuitem"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Light
              <svg
                v-if="!isSystemTheme && theme === 'light'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </button>
          <button
            @click="setTheme('dark'); isOpen = false"
            class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
            role="menuitem"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              Dark
              <svg
                v-if="!isSystemTheme && theme === 'dark'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </button>
          <button
            @click="setTheme('system'); isOpen = false"
            class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
            role="menuitem"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              System
              <svg
                v-if="isSystemTheme"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();
const isOpen = ref(false);

const theme = computed(() => themeStore.theme);
const isSystemTheme = computed(() => themeStore.isSystemTheme);

// Compute the effective theme (what's actually being displayed)
const effectiveTheme = computed(() => {
  if (theme.value === 'system') {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme.value;
});

// Dynamic title for the theme toggle button
const currentThemeTitle = computed(() => {
  if (isSystemTheme.value) {
    return `System theme (${effectiveTheme.value})`;
  }
  return `${theme.value.charAt(0).toUpperCase() + theme.value.slice(1)} theme`;
});

// Initialize theme and add event listener
themeStore.init();

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    isOpen.value = false;
  }
}

// Add event listener when component is mounted
document.addEventListener('click', handleClickOutside);

// Remove event listener when component is unmounted
window.addEventListener('beforeunload', () => {
  document.removeEventListener('click', handleClickOutside);
});

function setTheme(newTheme: 'light' | 'dark' | 'system') {
  themeStore.setTheme(newTheme);
}
</script> 
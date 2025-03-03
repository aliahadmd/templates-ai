import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref(localStorage.getItem('theme') || 'light');
  const systemTheme = ref(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const isSystemTheme = ref(localStorage.getItem('isSystemTheme') === 'true');

  // Actions
  function init() {
    // Apply theme on initialization
    applyTheme();

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light';
      if (isSystemTheme.value) {
        applyTheme();
      }
    });
  }

  function setTheme(newTheme: 'light' | 'dark' | 'system') {
    if (newTheme === 'system') {
      isSystemTheme.value = true;
      theme.value = systemTheme.value;
    } else {
      isSystemTheme.value = false;
      theme.value = newTheme;
    }
    
    localStorage.setItem('theme', theme.value);
    localStorage.setItem('isSystemTheme', isSystemTheme.value.toString());
    applyTheme();
  }

  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  function applyTheme() {
    const root = window.document.documentElement;
    
    if (theme.value === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Watchers
  watch(systemTheme, () => {
    if (isSystemTheme.value) {
      theme.value = systemTheme.value;
      applyTheme();
    }
  });

  return {
    theme,
    isSystemTheme,
    systemTheme,
    init,
    setTheme,
    toggleTheme
  };
}); 
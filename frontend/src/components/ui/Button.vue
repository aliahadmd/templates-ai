<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses,
      variantClasses,
      className
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'outline', 'ghost', 'link'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

defineEmits(['click']);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 px-3 text-xs';
    case 'lg':
      return 'h-12 px-6 text-base';
    default:
      return 'h-10 px-4 text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary';
    case 'danger':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive';
    case 'outline':
      return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent';
    case 'ghost':
      return 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent';
    case 'link':
      return 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary';
  }
});
</script> 
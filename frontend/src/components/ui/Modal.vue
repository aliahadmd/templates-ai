<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50" @click="closeOnBackdrop && close()">
    <div class="bg-card rounded-lg w-full max-w-md shadow-lg" @click.stop>
      <div class="flex justify-between items-center p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">{{ title }}</h3>
        <button 
          @click="close" 
          class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <div class="p-4">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="p-4 border-t border-border bg-accent">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script> 
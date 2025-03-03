<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    <main class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from './Navbar.vue';
</script> 
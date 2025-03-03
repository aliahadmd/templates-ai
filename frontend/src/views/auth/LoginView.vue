<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../../components/auth/LoginForm.vue';
</script> 
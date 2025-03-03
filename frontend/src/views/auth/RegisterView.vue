<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Create a new account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body">
          <RegisterForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '../../components/auth/RegisterForm.vue';
</script> 
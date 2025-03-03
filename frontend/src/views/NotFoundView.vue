<template>
  <div class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-9xl font-extrabold text-foreground">404</h1>
        <h2 class="mt-6 text-3xl font-bold text-foreground">Page not found</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div class="mt-8">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Go back home
        </router-link>
      </div>
    </div>
  </div>
</template> 
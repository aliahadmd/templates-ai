import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../views/auth/VerifyEmailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/auth/ResetPasswordView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/user/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/user/UsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('../views/role/RolesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/permissions',
    name: 'permissions',
    component: () => import('../views/permission/PermissionsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/examples/file-upload',
    name: 'file-upload-example',
    component: () => import('../views/examples/FileUploadExample.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuth: false }
  }
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth as boolean;
  const requiresAdmin = to.meta.requiresAdmin as boolean;
  const guestOnly = to.meta.guestOnly as boolean;

  // Check if route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires admin role
  if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'dashboard' });
    return;
  }

  // Check if route is for guests only
  if (guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  next();
});

export default router; 
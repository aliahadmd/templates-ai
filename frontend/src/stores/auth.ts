import { defineStore } from 'pinia';
import axios from 'axios';
import { ref, computed } from 'vue';
import router from '../router';

// Types
interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  profilePicture?: string;
  profilePictureKey?: string;
  role?: {
    id: string;
    name: string;
  };
  permissions?: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Initialize state from localStorage
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
  if (storedToken) {
    token.value = storedToken;
    // Set default Authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role?.name === 'admin');
  const hasPermission = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false;
  };

  // Actions
  const register = async (data: RegisterData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, data);
      token.value = response.data.data.accessToken;
      user.value = response.data.data;

      // Save to localStorage
      if (token.value) {
        localStorage.setItem('token', token.value);
        // Set default Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      }
      localStorage.setItem('user', JSON.stringify(user.value));

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      token.value = response.data.data.accessToken;
      user.value = response.data.data;

      // Save to localStorage
      if (token.value) {
        localStorage.setItem('token', token.value);
        // Set default Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      }
      localStorage.setItem('user', JSON.stringify(user.value));

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      if (token.value) {
        await axios.post(`${API_URL}/api/auth/logout`);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state and localStorage regardless of API call success
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      loading.value = false;

      // Redirect to login
      router.push('/login');
    }
  };

  const refreshToken = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`);
      token.value = response.data.data.accessToken;

      // Save to localStorage
      if (token.value) {
        localStorage.setItem('token', token.value);
        // Set default Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Token refresh failed';
      // If refresh fails, logout
      await logout();
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async () => {
    if (!token.value) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      user.value = response.data.data;

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user.value));

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user data';
      if (err.response?.status === 401) {
        // If unauthorized, try to refresh token
        try {
          await refreshToken();
          // Retry fetching user
          return await fetchUser();
        } catch (refreshErr) {
          // If refresh fails, logout
          await logout();
        }
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const verifyEmail = async (token: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, { token });
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Email verification failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (email: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password reset request failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password
      });
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password reset failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    loading.value = true;
    error.value = null;

    if (!token.value) {
      error.value = 'Authentication required';
      loading.value = false;
      throw new Error('Authentication required');
    }

    try {
      const response = await axios.put(`${API_URL}/api/users/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password change failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    hasPermission,

    // Actions
    register,
    login,
    logout,
    refreshToken,
    fetchUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword
  };
});
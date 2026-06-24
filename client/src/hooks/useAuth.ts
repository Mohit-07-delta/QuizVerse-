'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.isLoading && !store.user) {
      store.checkAuth();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    googleLogin: store.googleLogin,
    guestLogin: store.guestLogin,
    logout: store.logout,
    setUser: store.setUser,
    clearError: store.clearError,
  };
}

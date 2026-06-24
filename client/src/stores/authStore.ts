import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  guestLogin: (name: string, avatar?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('quizverse_token') : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      const { user, token } = data.data;
      localStorage.setItem('quizverse_token', token);
      localStorage.setItem('quizverse_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      let message = (err as any)?.response?.data?.message || 'Login failed';
      const errors = (err as any)?.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
        const firstKey = Object.keys(errors)[0];
        message = errors[firstKey][0];
      }
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (name, email, password, avatar) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register({ name, email, password, avatar });
      const { user, token } = data.data;
      localStorage.setItem('quizverse_token', token);
      localStorage.setItem('quizverse_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      let message = (err as any)?.response?.data?.message || 'Registration failed';
      const errors = (err as any)?.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
        const firstKey = Object.keys(errors)[0];
        message = errors[firstKey][0];
      }
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.googleLogin({ credential });
      const { user, token } = data.data;
      localStorage.setItem('quizverse_token', token);
      localStorage.setItem('quizverse_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  guestLogin: async (name, avatar) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.guestLogin({ name, avatar });
      const { user, token } = data.data;
      localStorage.setItem('quizverse_token', token);
      localStorage.setItem('quizverse_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Guest login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('quizverse_token');
    localStorage.removeItem('quizverse_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  setUser: (user) => {
    localStorage.setItem('quizverse_user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('quizverse_token', token);
    set({ token });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('quizverse_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      set({ user: data.data, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('quizverse_token');
      localStorage.removeItem('quizverse_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

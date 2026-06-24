import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

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

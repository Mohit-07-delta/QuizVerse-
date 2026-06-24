import axios from 'axios';
import type {
  ApiResponse, User, Quiz, Question, Game, Achievement,
  Analytics, LeaderboardEntry, AIGenerateRequest, AIGenerateResponse, Difficulty,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('quizverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('quizverse_token');
      localStorage.removeItem('quizverse_user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================
   Auth API
   ============================================ */

export const authAPI = {
  register: (data: { name: string; email: string; password: string; avatar?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  googleLogin: (data: { credential: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/google', data),

  guestLogin: (data: { name: string; avatar?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/guest', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),
};

/* ============================================
   Quiz API
   ============================================ */

export const quizAPI = {
  create: (data: Partial<Quiz>) =>
    api.post<ApiResponse<Quiz>>('/quizzes', data),

  getAll: (params?: { page?: number; limit?: number; category?: string; difficulty?: string; search?: string; sort?: string }) =>
    api.get<ApiResponse<Quiz[]>>('/quizzes', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Quiz>>(`/quizzes/${id}`),

  update: (id: string, data: Partial<Quiz>) =>
    api.put<ApiResponse<Quiz>>(`/quizzes/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/quizzes/${id}`),

  getMyQuizzes: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Quiz[]>>('/quizzes/me', { params }),

  rate: (id: string, rating: number) =>
    api.post<ApiResponse<Quiz>>(`/quizzes/${id}/rate`, { rating }),

  browse: (params?: { page?: number; limit?: number; category?: string; difficulty?: string; search?: string; sort?: string }) =>
    api.get<ApiResponse<Quiz[]>>('/quizzes/browse', { params }),
};

/* ============================================
   Game API
   ============================================ */

export const gameAPI = {
  create: (data: { quizId: string; gameMode?: string; maxPlayers?: number; settings?: Record<string, unknown> }) =>
    api.post<ApiResponse<Game>>('/games', data),

  getByPin: (pin: string) =>
    api.get<ApiResponse<Game>>(`/games/pin/${pin}`),

  getById: (id: string) =>
    api.get<ApiResponse<Game>>(`/games/${id}`),

  join: (pin: string, data: { playerName: string; avatar?: string }) =>
    api.post<ApiResponse<Game>>(`/games/${pin}/join`, data),

  getMyGames: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Game[]>>('/games/me', { params }),
};

/* ============================================
   AI API
   ============================================ */

export const aiAPI = {
  generateFromTopic: (data: { topic: string; questionCount: number; difficulty: Difficulty[] }) =>
    api.post<ApiResponse<AIGenerateResponse>>('/ai/generate/topic', data),

  generateFromText: (data: { text: string; questionCount: number; difficulty: Difficulty[] }) =>
    api.post<ApiResponse<AIGenerateResponse>>('/ai/generate/text', data),

  generateFromWikipedia: (data: { url: string; questionCount: number; difficulty: Difficulty[] }) =>
    api.post<ApiResponse<AIGenerateResponse>>('/ai/generate/wikipedia', data),

  getHint: (data: { question: string; options: string[] }) =>
    api.post<ApiResponse<{ hint: string }>>('/ai/hint', data),

  getExplanation: (data: { question: string; correctAnswer: string }) =>
    api.post<ApiResponse<{ explanation: string }>>('/ai/explain', data),
};

/* ============================================
   User API
   ============================================ */

export const userAPI = {
  getProfile: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/users/password', data),

  getAnalytics: () =>
    api.get<ApiResponse<Analytics>>('/users/analytics'),

  getAchievements: () =>
    api.get<ApiResponse<Achievement[]>>('/users/achievements'),

  deleteAccount: () =>
    api.delete<ApiResponse<null>>('/users/account'),
};

/* ============================================
   Leaderboard API
   ============================================ */

export const leaderboardAPI = {
  get: (period: 'weekly' | 'monthly' | 'alltime' = 'weekly', limit: number = 50) =>
    api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard', { params: { period, limit } }),
};

/* ============================================
   Social / Friends API
   ============================================ */

export const socialAPI = {
  getFriends: () =>
    api.get<ApiResponse<User[]>>('/social/friends'),

  sendRequest: (userId: string) =>
    api.post<ApiResponse<null>>(`/social/friends/request/${userId}`),

  acceptRequest: (userId: string) =>
    api.post<ApiResponse<null>>(`/social/friends/accept/${userId}`),

  rejectRequest: (userId: string) =>
    api.post<ApiResponse<null>>(`/social/friends/reject/${userId}`),

  removeFriend: (userId: string) =>
    api.delete<ApiResponse<null>>(`/social/friends/${userId}`),

  getPendingRequests: () =>
    api.get<ApiResponse<User[]>>('/social/friends/pending'),
};

/* ============================================
   Admin API
   ============================================ */

export const adminAPI = {
  getStats: () =>
    api.get<ApiResponse<{ users: number; quizzes: number; games: number; activeNow: number }>>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params }),

  updateUserRole: (userId: string, role: string) =>
    api.put<ApiResponse<User>>(`/admin/users/${userId}/role`, { role }),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<null>>(`/admin/users/${userId}`),

  getQuizzes: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Quiz[]>>('/admin/quizzes', { params }),

  featureQuiz: (quizId: string, featured: boolean) =>
    api.put<ApiResponse<Quiz>>(`/admin/quizzes/${quizId}/feature`, { featured }),

  deleteQuiz: (quizId: string) =>
    api.delete<ApiResponse<null>>(`/admin/quizzes/${quizId}`),
};

export { api };
export default api;

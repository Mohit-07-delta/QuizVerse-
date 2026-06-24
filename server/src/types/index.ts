import type { Request } from "express";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  googleId?: string | null;
  avatar: string;
  role: "USER" | "ADMIN";
  xp: number;
  level: number;
  streakDays: number;
  lastLoginDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Question ─────────────────────────────────────────────────────────────────

export interface IQuestion {
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "IMAGE";
  options: string[];
  correctAnswer: number;
  imageUrl?: string | null;
  timer: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hints: string[];
  explanation?: string | null;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface IQuiz {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "MIXED";
  isPublic: boolean;
  coverImage?: string | null;
  questions: IQuestion[];
  plays: number;
  rating: number;
  totalRatings: number;
  tags: string[];
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Player Answer ────────────────────────────────────────────────────────────

export interface IPlayerAnswer {
  questionIndex: number;
  answer: number;
  isCorrect: boolean;
  timeTaken: number;
  pointsEarned: number;
}

// ─── Game Player ──────────────────────────────────────────────────────────────

export interface IGamePlayer {
  userId?: string | null;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  bestStreak: number;
  combo: number;
  xpEarned: number;
  answers: IPlayerAnswer[];
  isConnected: boolean;
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface IGame {
  id: string;
  quizId: string;
  hostId: string;
  pin: string;
  mode:
    | "CLASSIC"
    | "TEAM_BATTLE"
    | "DUEL"
    | "ELIMINATION"
    | "BATTLE_ROYALE"
    | "SPEED_CHALLENGE"
    | "PRACTICE";
  status: "WAITING" | "IN_PROGRESS" | "FINISHED";
  currentQuestion: number;
  players: IGamePlayer[];
  maxPlayers: number;
  createdAt: Date;
  startedAt?: Date | null;
  endedAt?: Date | null;
}

// ─── Socket Game State (in-memory) ────────────────────────────────────────────

export interface GameState {
  pin: string;
  quizId: string;
  hostSocketId: string;
  hostUserId: string;
  questions: IQuestion[];
  currentQuestion: number;
  players: Map<string, SocketPlayer>;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED";
  timer: ReturnType<typeof setInterval> | null;
  timeLeft: number;
  answeredCount: number;
  questionStartTime: number;
  maxPlayers: number;
  mode: string;
  gameDbId: string;
}

export interface SocketPlayer {
  socketId: string;
  userId?: string | null;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  bestStreak: number;
  combo: number;
  xpEarned: number;
  answers: IPlayerAnswer[];
  isConnected: boolean;
  hasAnswered: boolean;
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  isGuest?: boolean;
}

// ─── Express Request Extension ────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Achievement Context ──────────────────────────────────────────────────────

export interface AchievementContext {
  totalGamesPlayed?: number;
  accuracy?: number;
  fastestAnswer?: number;
  currentStreak?: number;
  friendCount?: number;
  quizzesCreated?: number;
  wikiQuizzesPlayed?: number;
  perfectScore?: boolean;
}

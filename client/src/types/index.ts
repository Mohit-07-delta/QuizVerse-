/* ============================================
   QuizVerse AI — TypeScript Type Definitions
   ============================================ */

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  quizzesCreated: number;
  totalScore: number;
  accuracy: number;
  achievements: Achievement[];
  friends: string[];
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: Difficulty;
  coverImage?: string;
  questions: Question[];
  creator: User | string;
  isPublic: boolean;
  isDraft: boolean;
  plays: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  sourceType?: 'manual' | 'ai' | 'wikipedia';
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id?: string;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'IMAGE';
  options: QuestionOption[];
  correctAnswer: number;
  difficulty: Difficulty;
  timeLimit: number;
  points: number;
  hint?: string;
  explanation?: string;
  imageUrl?: string;
  category?: string;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Game {
  _id: string;
  pin: string;
  quiz: Quiz | string;
  host: User | string;
  players: GamePlayer[];
  status: GameStatus;
  currentQuestion: number;
  gameMode: GameMode;
  maxPlayers: number;
  settings: GameSettings;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface GameSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showLeaderboardAfterEach: boolean;
  allowLateJoin: boolean;
  pointsMultiplier: number;
}

export interface GamePlayer {
  id: string;
  name: string;
  oduble: string;
  score: number;
  streak: number;
  longestStreak: number;
  correctAnswers: number;
  totalAnswers: number;
  rank: number;
  isHost: boolean;
  isConnected: boolean;
  answers: PlayerAnswer[];
}

export interface PlayerAnswer {
  questionIndex: number;
  answer: number;
  isCorrect: boolean;
  timeMs: number;
  points: number;
  streak: number;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'creation' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface Analytics {
  totalGames: number;
  totalQuizzes: number;
  totalScore: number;
  averageAccuracy: number;
  averageScore: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  categoryBreakdown: CategoryStat[];
  recentGames: GameHistory[];
  dailyStats: DailyStat[];
  weakTopics: string[];
  strongTopics: string[];
}

export interface CategoryStat {
  category: string;
  played: number;
  accuracy: number;
  averageScore: number;
}

export interface GameHistory {
  _id: string;
  quizTitle: string;
  score: number;
  rank: number;
  totalPlayers: number;
  accuracy: number;
  playedAt: string;
}

export interface DailyStat {
  date: string;
  gamesPlayed: number;
  averageAccuracy: number;
  totalScore: number;
  xpEarned: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  gamesPlayed: number;
  winRate: number;
  accuracy: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GameState {
  game: Game | null;
  players: GamePlayer[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  myAnswer: number | null;
  myScore: number;
  myStreak: number;
  myCombo: number;
  timeLeft: number;
  gameStatus: GameStatus;
  leaderboard: GamePlayer[];
  questionResult: QuestionResult | null;
  lastPointsEarned: number;
}

export interface QuestionResult {
  correctAnswer: number;
  myAnswer: number;
  isCorrect: boolean;
  points: number;
  streak: number;
  explanation?: string;
  stats: {
    totalAnswers: number;
    distribution: number[];
  };
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'waiting' | 'starting' | 'in_progress' | 'question_results' | 'leaderboard' | 'finished';
export type GameMode = 'classic' | 'speed' | 'elimination' | 'team';
export type QuizCategory =
  | 'general'
  | 'science'
  | 'history'
  | 'geography'
  | 'technology'
  | 'mathematics'
  | 'literature'
  | 'arts'
  | 'sports'
  | 'entertainment'
  | 'nature'
  | 'politics'
  | 'philosophy'
  | 'music'
  | 'food'
  | 'language'
  | 'custom';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AIGenerateRequest {
  topic?: string;
  text?: string;
  wikipediaUrl?: string;
  questionCount: number;
  difficulty: Difficulty[];
  category?: QuizCategory;
}

export interface AIGenerateResponse {
  questions: Question[];
  title: string;
  description: string;
  category: QuizCategory;
}

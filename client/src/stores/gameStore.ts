import { create } from 'zustand';
import type { Game, GamePlayer, Question, QuestionResult, GameStatus } from '@/types';

interface GameStore {
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
  isHost: boolean;
  myPlayerId: string | null;
  answerSubmitted: boolean;

  setGame: (game: Game) => void;
  setPlayers: (players: GamePlayer[]) => void;
  addPlayer: (player: GamePlayer) => void;
  removePlayer: (playerId: string) => void;
  setCurrentQuestion: (question: Question, index: number, total: number) => void;
  setMyAnswer: (answer: number | null) => void;
  setMyScore: (score: number) => void;
  updateScore: (points: number) => void;
  setMyStreak: (streak: number) => void;
  setMyCombo: (combo: number) => void;
  setTimeLeft: (time: number) => void;
  setGameStatus: (status: GameStatus) => void;
  setLeaderboard: (leaderboard: GamePlayer[]) => void;
  setQuestionResult: (result: QuestionResult) => void;
  setLastPointsEarned: (points: number) => void;
  setIsHost: (isHost: boolean) => void;
  setMyPlayerId: (id: string) => void;
  setAnswerSubmitted: (submitted: boolean) => void;
  resetQuestion: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  players: [],
  currentQuestion: null,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  myAnswer: null,
  myScore: 0,
  myStreak: 0,
  myCombo: 0,
  timeLeft: 0,
  gameStatus: 'waiting',
  leaderboard: [],
  questionResult: null,
  lastPointsEarned: 0,
  isHost: false,
  myPlayerId: null,
  answerSubmitted: false,

  setGame: (game) => set({ game }),
  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.id === player.id)
        ? state.players
        : [...state.players, player],
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  setCurrentQuestion: (question, index, total) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: index,
      totalQuestions: total,
      myAnswer: null,
      answerSubmitted: false,
      questionResult: null,
    }),

  setMyAnswer: (answer) => set({ myAnswer: answer, answerSubmitted: answer !== null }),
  setMyScore: (score) => set({ myScore: score }),
  updateScore: (points) => set((state) => ({ myScore: state.myScore + points })),
  setMyStreak: (streak) => set({ myStreak: streak }),
  setMyCombo: (combo) => set({ myCombo: combo }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setQuestionResult: (result) => set({ questionResult: result }),
  setLastPointsEarned: (points) => set({ lastPointsEarned: points }),
  setIsHost: (isHost) => set({ isHost }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setAnswerSubmitted: (submitted) => set({ answerSubmitted: submitted }),

  resetQuestion: () =>
    set({
      myAnswer: null,
      answerSubmitted: false,
      questionResult: null,
      lastPointsEarned: 0,
    }),

  resetGame: () =>
    set({
      game: null,
      players: [],
      currentQuestion: null,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      myAnswer: null,
      myScore: 0,
      myStreak: 0,
      myCombo: 0,
      timeLeft: 0,
      gameStatus: 'waiting',
      leaderboard: [],
      questionResult: null,
      lastPointsEarned: 0,
      isHost: false,
      myPlayerId: null,
      answerSubmitted: false,
    }),
}));

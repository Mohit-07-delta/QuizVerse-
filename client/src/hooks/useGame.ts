'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useGameStore } from '@/stores/gameStore';
import { gameAPI } from '@/lib/api';
import type { Game, GamePlayer, Question, QuestionResult } from '@/types';

export function useGame() {
  const { socket, isConnected, emit, on } = useSocket();
  const store = useGameStore();

  useEffect(() => {
    if (!isConnected) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      on<{ game: Game; playerId: string }>('game:joined', ({ game, playerId }) => {
        store.setGame(game);
        store.setPlayers(game.players);
        store.setMyPlayerId(playerId);
        store.setGameStatus('waiting');
      })
    );

    unsubs.push(
      on<{ player: GamePlayer }>('game:playerJoined', ({ player }) => {
        store.addPlayer(player);
      })
    );

    unsubs.push(
      on<{ playerId: string }>('game:playerLeft', ({ playerId }) => {
        store.removePlayer(playerId);
      })
    );

    unsubs.push(
      on('game:starting', () => {
        store.setGameStatus('starting');
      })
    );

    unsubs.push(
      on<{ question: Question; index: number; total: number }>('game:question', ({ question, index, total }) => {
        store.setCurrentQuestion(question, index, total);
        store.setGameStatus('in_progress');
        store.setTimeLeft(question.timeLimit);
      })
    );

    unsubs.push(
      on<{ timeLeft: number }>('game:timer', ({ timeLeft }) => {
        store.setTimeLeft(timeLeft);
      })
    );

    unsubs.push(
      on<{ result: QuestionResult; score: number; streak: number }>('game:answerResult', ({ result, score, streak }) => {
        store.setQuestionResult(result);
        store.setLastPointsEarned(result.points);
        store.setMyScore(score);
        store.setMyStreak(streak);
        store.setGameStatus('question_results');
      })
    );

    unsubs.push(
      on<{ leaderboard: GamePlayer[] }>('game:leaderboard', ({ leaderboard }) => {
        store.setLeaderboard(leaderboard);
        store.setGameStatus('leaderboard');
      })
    );

    unsubs.push(
      on<{ leaderboard: GamePlayer[]; game: Game }>('game:finished', ({ leaderboard, game }) => {
        store.setLeaderboard(leaderboard);
        store.setGame(game);
        store.setGameStatus('finished');
      })
    );

    unsubs.push(
      on<{ message: string }>('game:error', ({ message }) => {
        console.error('[Game Error]', message);
      })
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [isConnected, on, store]);

  const createGame = useCallback(
    async (quizId: string, gameMode?: string) => {
      const { data } = await gameAPI.create({ quizId, gameMode });
      store.setGame(data.data);
      store.setIsHost(true);
      store.setGameStatus('waiting');
      return data.data;
    },
    [store]
  );

  const joinGame = useCallback(
    (pin: string, playerName: string, avatar?: string) => {
      emit('game:join', { pin, playerName, avatar });
    },
    [emit]
  );

  const startGame = useCallback(() => {
    if (store.game) {
      emit('game:start', { pin: store.game.pin });
    }
  }, [emit, store.game]);

  const submitAnswer = useCallback(
    (answerIndex: number, timeMs: number) => {
      if (store.game && !store.answerSubmitted) {
        store.setMyAnswer(answerIndex);
        emit('game:answer', {
          pin: store.game.pin,
          questionIndex: store.currentQuestionIndex,
          answer: answerIndex,
          timeMs,
        });
      }
    },
    [emit, store]
  );

  const nextQuestion = useCallback(() => {
    if (store.game) {
      emit('game:nextQuestion', { pin: store.game.pin });
    }
  }, [emit, store.game]);

  const requestHint = useCallback(() => {
    if (store.game) {
      emit('game:hint', { pin: store.game.pin, questionIndex: store.currentQuestionIndex });
    }
  }, [emit, store]);

  return {
    ...store,
    isConnected,
    socket,
    createGame,
    joinGame,
    startGame,
    submitAnswer,
    nextQuestion,
    requestHint,
  };
}

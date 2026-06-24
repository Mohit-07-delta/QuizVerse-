'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { QuestionDisplay } from '@/components/quiz/QuestionDisplay';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { Timer } from '@/components/quiz/Timer';
import { ScorePopup } from '@/components/quiz/ScorePopup';
import { LiveLeaderboard } from '@/components/game/LiveLeaderboard';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';

export default function GamePlayWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const pin = params?.pin as string;

  const { user } = useAuthStore();
  const store = useGameStore();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [roundLeaderboard, setRoundLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!pin) return;

    const nickname = sessionStorage.getItem('play_nickname') || user?.name || 'Player';
    const avatar = sessionStorage.getItem('play_avatar') || user?.avatar || 'avatar1';

    // Connect to Socket.IO Server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      query: { token: localStorage.getItem('token') || '' }
    });

    setSocket(socketInstance);
    setLoading(false);

    // Join room
    if (store.isHost) {
      socketInstance.emit('create-game', { pin, userId: user?._id });
    } else {
      socketInstance.emit('join-game', { pin, nickname, avatar, userId: user?._id });
    }

    // --- Socket Game Engine Events ---
    socketInstance.on('question', (data: any) => {
      // Map question structure
      const mappedQuestion = {
        text: data.text,
        type: data.type as 'MCQ' | 'TRUE_FALSE' | 'IMAGE',
        options: data.options.map((opt: string) => ({ text: opt, isCorrect: false })),
        correctAnswer: 0, // Hidden until round ends
        difficulty: 'medium' as const,
        timeLimit: data.timer,
        points: 1000,
        imageUrl: data.imageUrl || undefined,
      };

      store.setCurrentQuestion(mappedQuestion, data.questionIndex, data.totalQuestions);
      store.setTimeLeft(data.timer);
      store.setGameStatus('in_progress');
      store.setAnswerSubmitted(false);
      store.setMyAnswer(null);
      setShowResultPopup(false);
      setAnsweredCount(0);
    });

    socketInstance.on('timer-tick', (data: any) => {
      store.setTimeLeft(data.timeLeft);
    });

    socketInstance.on('player-answered', (data: any) => {
      setAnsweredCount(data.answeredCount);
      setTotalPlayers(data.totalPlayers);
    });

    socketInstance.on('answer-result', (data: any) => {
      // Show correct/incorrect popup and update local state
      store.setQuestionResult({
        correctAnswer: data.correctAnswer,
        myAnswer: store.myAnswer || 0,
        isCorrect: data.isCorrect,
        points: data.points,
        streak: data.streak,
        explanation: data.explanation || undefined,
        stats: { totalAnswers: 0, distribution: [] },
      });
      store.setMyScore(data.totalScore);
      store.setMyStreak(data.streak);
      store.setMyCombo(data.combo);
      store.setLastPointsEarned(data.points);
      setShowResultPopup(true);
    });

    socketInstance.on('question-over', (data: any) => {
      store.setGameStatus('question_results');
      setRoundLeaderboard(data.leaderboard);
      // Expose explanation
      if (store.questionResult) {
        store.setQuestionResult({
          ...store.questionResult,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
        });
      } else {
        // If player didn't answer, show results
        store.setQuestionResult({
          correctAnswer: data.correctAnswer,
          myAnswer: -1,
          isCorrect: false,
          points: 0,
          streak: 0,
          explanation: data.explanation,
          stats: { totalAnswers: 0, distribution: [] },
        });
        setShowResultPopup(true);
      }
    });

    socketInstance.on('game-ended', (data: any) => {
      // Store final state in session storage so results page can display it
      sessionStorage.setItem('final_podium', JSON.stringify(data.podium));
      sessionStorage.setItem('final_leaderboard', JSON.stringify(data.leaderboard));
      
      const myNickname = sessionStorage.getItem('play_nickname') || user?.name || '';
      const me = data.leaderboard.find((p: any) => p.nickname.toLowerCase() === myNickname.toLowerCase());
      if (me) {
        sessionStorage.setItem('final_my_stats', JSON.stringify({ score: me.score, xpEarned: me.xpEarned || 0 }));
      }

      store.setGameStatus('finished');
      router.push(`/game/${pin}/results`);
    });

    socketInstance.on('host-disconnected', () => {
      toast.error('Host disconnected from the session.');
      router.push('/play');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [pin, loading]);

  const handleSelectOption = (idx: number) => {
    if (store.answerSubmitted || store.gameStatus !== 'in_progress') return;
    store.setMyAnswer(idx);
    if (socket) {
      socket.emit('submit-answer', { pin, answerIndex: idx });
    }
  };

  const handleNextQuestion = () => {
    if (socket && store.isHost) {
      socket.emit('next-question', { pin });
    }
  };

  if (loading || !store.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400 font-sans">
            {store.isHost ? 'Initiating question stream...' : 'Waiting for host to send next question...'}
          </p>
        </div>
      </div>
    );
  }

  const hasAnswered = store.myAnswer !== null;

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden relative">
      {/* Background glow decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Header controls bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <Timer timeLeft={store.timeLeft} duration={store.currentQuestion.timeLimit} />
          {!store.isHost && (
            <div className="text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Score</span>
              <span className="text-xl font-extrabold font-heading text-cyan-400">{store.myScore} pts</span>
            </div>
          )}
        </div>

        {/* Counter of responses */}
        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Answers</span>
          <span className="text-lg font-bold font-heading text-white">{answeredCount}/{totalPlayers || store.players.length}</span>
        </div>

        {/* Host Control Actions */}
        {store.isHost && store.gameStatus === 'question_results' && (
          <Button
            onClick={handleNextQuestion}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-bold px-6 shadow-lg shadow-purple-500/25"
          >
            Next Question
          </Button>
        )}
      </div>

      {/* Primary Question text & visual */}
      <div className="flex-grow flex flex-col justify-center py-4 relative z-10">
        <QuestionDisplay
          question={store.currentQuestion}
          index={store.currentQuestionIndex}
          total={store.totalQuestions}
        />

        {/* Answer choices Grid */}
        {store.gameStatus === 'in_progress' ? (
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {store.currentQuestion.options.map((option, idx) => (
              <AnswerButton
                key={idx}
                index={idx}
                text={option.text}
                isSelected={store.myAnswer === idx}
                isDisabled={hasAnswered}
                onClick={() => handleSelectOption(idx)}
              />
            ))}
          </div>
        ) : (
          /* Show Live Standings Leaderboard in between rounds */
          <div className="w-full mt-4">
            <LiveLeaderboard
              leaderboard={roundLeaderboard.length > 0 ? roundLeaderboard : store.players}
              currentUsername={sessionStorage.getItem('play_nickname')}
            />
          </div>
        )}
      </div>

      {/* Answer result overlay Popup */}
      {showResultPopup && store.questionResult && (
        <ScorePopup
          isVisible={showResultPopup}
          isCorrect={store.questionResult.isCorrect}
          pointsEarned={store.lastPointsEarned}
          streak={store.myStreak}
          combo={store.myCombo}
        />
      )}
    </div>
  );
}

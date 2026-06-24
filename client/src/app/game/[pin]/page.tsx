'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';
import { WaitingRoom } from '@/components/game/WaitingRoom';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function GameLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const pin = params?.pin as string;

  const { user } = useAuthStore();
  const store = useGameStore();

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!pin) return;

    // 1. Fetch Game info from REST API
    const loadGame = async () => {
      try {
        const res = await api.get(`/games/${pin}`);
        if (res.data?.success) {
          const gameData = res.data.data;
          store.setGame(gameData);
          store.setPlayers(gameData.players);

          // Check if current user is the host
          if (user && gameData.host?.id === user._id) {
            store.setIsHost(true);
          } else {
            store.setIsHost(false);
          }
        }
      } catch (err) {
        toast.error('Game not found.');
        router.push('/play');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [pin, user, router]);

  useEffect(() => {
    if (!pin || loading || !store.game) return;

    // Get nickname and avatar from sessionStorage or user profile
    const nickname = sessionStorage.getItem('play_nickname') || user?.name || 'Player';
    const avatar = sessionStorage.getItem('play_avatar') || user?.avatar || 'avatar1';

    // 2. Connect to Socket.IO Server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      query: { token: localStorage.getItem('quizverse_token') || '' }
    });

    setSocket(socketInstance);

    // Join lobby
    if (store.isHost) {
      socketInstance.emit('create-game', { pin, userId: user?._id });
    } else {
      socketInstance.emit('join-game', { pin, nickname, avatar, userId: user?._id });
    }

    // --- Socket Listeners ---
    socketInstance.on('game-created', () => {
      console.log('Lobby hosted successfully on socket.');
    });

    socketInstance.on('joined-lobby', () => {
      console.log('Joined lobby successfully.');
    });

    socketInstance.on('players-update', (playersList: any[]) => {
      // Map backend players list to frontend GamePlayer structure
      const mapped = playersList.map((p, idx) => ({
        id: p.userId || `p-${idx}`,
        name: p.nickname,
        oduble: p.avatar,
        score: p.score,
        streak: 0,
        longestStreak: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        rank: idx + 1,
        isHost: false,
        isConnected: p.isConnected,
        answers: [],
      }));
      store.setPlayers(mapped);
    });

    socketInstance.on('game-started', () => {
      toast.success('Game is starting! Get ready...');
      store.setGameStatus('starting');
      // Redirect to play workspace
      setTimeout(() => {
        router.push(`/game/${pin}/play`);
      }, 1500);
    });

    socketInstance.on('error', (err: any) => {
      toast.error(err.message || 'Lobby connection error.');
      router.push('/play');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [pin, loading, store.game, store.isHost]);

  const handleStartGame = () => {
    if (socket) {
      socket.emit('start-game', { pin });
    }
  };

  if (loading || !store.game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between">
      <div className="flex-grow flex items-center py-12">
        <WaitingRoom
          game={store.game}
          players={store.players}
          isHost={store.isHost}
          onStartGame={handleStartGame}
        />
      </div>
    </div>
  );
}

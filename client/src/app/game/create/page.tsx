'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

function CreateGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');
  const hasCreated = useRef(false);

  useEffect(() => {
    if (!quizId) {
      toast.error('No Quiz ID provided.');
      router.push('/dashboard');
      return;
    }

    const createGame = async () => {
      if (hasCreated.current) return;
      hasCreated.current = true;

      try {
        const { data } = await gameAPI.create({ quizId });
        const game = data.data;
        if (game && game.pin) {
          toast.success('Game session created!');
          router.push(`/game/${game.pin}`);
        } else {
          throw new Error('Invalid game data returned');
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to host game');
        router.push('/dashboard');
      }
    };

    createGame();
  }, [quizId, router]);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <h2 className="text-xl font-heading text-white">Creating your game room...</h2>
      <p className="text-dark-300">Generating a unique PIN...</p>
    </div>
  );
}

export default function CreateGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <h2 className="text-xl font-heading text-white">Loading...</h2>
      </div>
    }>
      <CreateGameContent />
    </Suspense>
  );
}

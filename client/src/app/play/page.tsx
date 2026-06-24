'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCpu, FiPlay, FiSmile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const AVATARS = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];

export default function PlayJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { user } = useAuthStore();
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);

  // Pre-fill fields if search query is present
  useEffect(() => {
    const queryPin = searchParams.get('pin');
    if (queryPin) {
      setPin(queryPin);
    }
    
    if (user) {
      setNickname(user.name);
      setAvatar(user.avatar || AVATARS[0]);
    }
  }, [searchParams, user]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) {
      toast.error('Game PIN and nickname are required.');
      return;
    }

    setLoading(true);
    try {
      // Validate game exists and player can join
      const res = await api.post('/games/join', {
        pin: pin.trim(),
        nickname: nickname.trim(),
        avatar,
      });

      if (res.data?.success) {
        toast.success('Joined game successfully!');
        // Store current play credentials for socket use
        sessionStorage.setItem('play_nickname', nickname);
        sessionStorage.setItem('play_avatar', avatar);
        
        router.push(`/game/${pin}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join game room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-dark-900 overflow-hidden">
      {/* Background blur decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold font-heading text-white">
            <FiCpu className="text-purple-500 text-3xl animate-pulse" />
            <span>QuizVerse <span className="text-cyan-400">AI</span></span>
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Enter Game PIN to join multiplayer
          </p>
        </div>

        <Card className="p-8 bg-dark-800/40 border border-purple-500/15 backdrop-blur-md">
          <form onSubmit={handleJoin} className="space-y-5">
            <Input
              label="6-Digit Game PIN"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="e.g. 583920"
              className="text-center tracking-widest text-2xl font-black text-white"
              required
            />

            <Input
              label="Nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. SpeedDemon"
              icon={<FiSmile className="text-gray-400" />}
              required
            />

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Choose Game Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden flex items-center justify-center p-1 bg-dark-900 transition ${
                      avatar === av
                        ? 'border-cyan-400 scale-105 shadow shadow-cyan-500/20'
                        : 'border-purple-500/10 hover:border-purple-500/30'
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${av}`}
                      alt={av}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3.5 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5"
            >
              <FiPlay /> Join Room
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHome, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import Avatar from '../ui/Avatar';

interface PodiumEntry {
  rank: number;
  nickname: string;
  avatar: string;
  score: number;
}

interface ResultsScreenProps {
  podium: PodiumEntry[];
  leaderboard: { nickname: string; score: number; xpEarned?: number }[];
  myStats?: { score: number; xpEarned: number } | null;
  myNickname?: string | null;
}

export function ResultsScreen({ podium, leaderboard, myStats, myNickname }: ResultsScreenProps) {
  useEffect(() => {
    // Run confetti animation on win mount
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a78bfa', '#06b6d4', '#ec4899'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a78bfa', '#06b6d4', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  // Sort podium items by rank to ensure correct alignment (2nd on left, 1st in center, 3rd on right)
  const first = podium.find(p => p.rank === 1);
  const second = podium.find(p => p.rank === 2);
  const third = podium.find(p => p.rank === 3);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Celebration Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow">
          Victory Celebration!
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-sans">
          The battle has ended. Honor the champions of QuizVerse!
        </p>
      </div>

      {/* Podium View */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-12 mt-4 px-4">
        {/* 2nd Place */}
        {second && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center w-full md:w-48 order-2 md:order-1"
          >
            <Avatar name={second.nickname} src={second.avatar} size="lg" />
            <h4 className="font-heading font-bold text-gray-300 mt-3 truncate max-w-full text-center">
              {second.nickname}
            </h4>
            <div className="w-full bg-dark-800/40 border border-purple-500/10 backdrop-blur-md rounded-t-xl p-4 text-center mt-3 h-28 flex flex-col justify-end">
              <span className="text-3xl font-extrabold font-heading text-gray-400">2nd</span>
              <span className="text-xs text-gray-400 font-bold mt-1">{second.score} pts</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center w-full md:w-56 order-1 md:order-2 z-10 -translate-y-4"
          >
            <div className="relative">
              {/* Crown indicator */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl select-none animate-bounce">👑</span>
              <Avatar name={first.nickname} src={first.avatar} size="xl" className="border-4 border-yellow-500 shadow-xl shadow-yellow-500/25" />
            </div>
            <h4 className="font-heading font-extrabold text-yellow-400 mt-3 truncate max-w-full text-center">
              {first.nickname}
            </h4>
            <div className="w-full bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-t-xl p-5 text-center mt-3 h-36 flex flex-col justify-end shadow-2xl">
              <span className="text-4xl font-black font-heading text-yellow-500">1st</span>
              <span className="text-sm text-yellow-400 font-bold mt-1">{first.score} pts</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {third && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center w-full md:w-48 order-3"
          >
            <Avatar name={third.nickname} src={third.avatar} size="lg" />
            <h4 className="font-heading font-bold text-amber-500 mt-3 truncate max-w-full text-center">
              {third.nickname}
            </h4>
            <div className="w-full bg-dark-800/40 border border-purple-500/10 backdrop-blur-md rounded-t-xl p-4 text-center mt-3 h-24 flex flex-col justify-end">
              <span className="text-3xl font-extrabold font-heading text-amber-600">3rd</span>
              <span className="text-xs text-gray-400 font-bold mt-1">{third.score} pts</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rewards Info for current user */}
      {myStats && (
        <Card className="p-6 bg-purple-500/10 border border-purple-500/25 mb-8 max-w-xl mx-auto text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
          <h3 className="text-lg font-bold font-heading text-white mb-3">Your Game Summary</h3>
          <div className="flex justify-center gap-8">
            <div>
              <span className="block text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">XP Earned</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-heading">+{myStats.xpEarned} XP</span>
            </div>
            <div className="w-[1px] bg-purple-500/20" />
            <div>
              <span className="block text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Final Score</span>
              <span className="text-2xl font-extrabold text-purple-400 font-heading">{myStats.score} pts</span>
            </div>
          </div>
        </Card>
      )}

      {/* Complete Leaderboard */}
      <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md mb-8 max-w-xl mx-auto">
        <h3 className="text-lg font-bold font-heading text-white mb-4 border-b border-purple-500/10 pb-2 flex items-center gap-2">
          <FiAward className="text-yellow-500" /> Rankings
        </h3>
        <div className="space-y-2">
          {leaderboard.map((player, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center p-3 rounded-lg text-sm border ${
                myNickname && player.nickname.toLowerCase() === myNickname.toLowerCase()
                  ? 'bg-purple-500/10 border-purple-500/30 text-white'
                  : 'bg-dark-900/40 border-transparent text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-500 w-4">{idx + 1}.</span>
                <span className="font-semibold">{player.nickname}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white">{player.score.toLocaleString()} pts</span>
                {player.xpEarned && <span className="text-xs text-cyan-400">+{player.xpEarned} XP</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 px-6">
            <FiHome /> Home Dashboard
          </Button>
        </Link>
        <Link href="/browse" className="w-full sm:w-auto">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 flex items-center justify-center gap-2 px-6">
            <FiTrendingUp /> Explore Quizzes
          </Button>
        </Link>
      </div>
    </div>
  );
}
export default ResultsScreen;

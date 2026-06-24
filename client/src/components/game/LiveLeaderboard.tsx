'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiZap } from 'react-icons/fi';
import type { GamePlayer } from '@/types';
import { Card } from '../ui/Card';
import Avatar from '../ui/Avatar';

interface LiveLeaderboardProps {
  leaderboard: GamePlayer[];
  currentUsername?: string | null;
}

export function LiveLeaderboard({ leaderboard, currentUsername }: LiveLeaderboardProps) {
  // Sort leaderboard descending by score
  const sortedPlayers = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-2 mb-6 border-b border-purple-500/10 pb-3">
          <FiAward className="text-2xl text-yellow-400" />
          <h3 className="text-xl font-bold font-heading text-white">
            Current Standings
          </h3>
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const isMe = currentUsername && player.name.toLowerCase() === currentUsername.toLowerCase();
            const rank = index + 1;

            return (
              <motion.div
                key={player.id || player.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isMe
                    ? 'bg-purple-500/15 border-purple-400/30'
                    : 'bg-dark-900/60 border-purple-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-heading ${
                    rank === 1
                      ? 'bg-yellow-500 text-dark-900 shadow-md shadow-yellow-500/20'
                      : rank === 2
                      ? 'bg-gray-300 text-dark-900'
                      : rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-dark-800 text-gray-400'
                  }`}>
                    {rank}
                  </span>

                  <Avatar name={player.name} src={player.oduble} size="xs" />

                  <span className={`font-heading font-semibold text-sm ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                    {player.name}
                  </span>

                  {player.streak > 2 && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-400 font-bold">
                      <FiZap className="fill-current" /> {player.streak}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-white">
                    {player.score.toLocaleString()} <span className="text-[10px] text-gray-500">pts</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
export default LiveLeaderboard;

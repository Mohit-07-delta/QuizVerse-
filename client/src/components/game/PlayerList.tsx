'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GamePlayer } from '@/types';
import Avatar from '../ui/Avatar';
import { Card } from '../ui/Card';

interface PlayerListProps {
  players: GamePlayer[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading text-white">
          Connected Players
        </h3>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/35 text-purple-300">
          {players.length} joined
        </span>
      </div>

      {players.length === 0 ? (
        <Card className="p-8 text-center bg-dark-800/20 border border-dashed border-purple-500/10 text-gray-500">
          Waiting for players to connect...
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence>
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Card className={`p-4 text-center bg-dark-800/40 border backdrop-blur-md relative overflow-hidden flex flex-col items-center gap-2 ${
                  player.isConnected ? 'border-purple-500/10' : 'border-red-500/30 opacity-60'
                }`}>
                  <Avatar name={player.name} src={player.oduble} size="md" />
                  
                  <div className="font-heading font-semibold text-sm truncate max-w-full text-white">
                    {player.name}
                  </div>

                  {!player.isConnected && (
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                      Disconnected
                    </span>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
export default PlayerList;

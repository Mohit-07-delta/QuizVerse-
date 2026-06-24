'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiCpu } from 'react-icons/fi';
import type { Game, GamePlayer } from '@/types';
import { GamePin } from './GamePin';
import { PlayerList } from './PlayerList';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface WaitingRoomProps {
  game: Game;
  players: GamePlayer[];
  isHost: boolean;
  onStartGame: () => void;
}

export function WaitingRoom({ game, players, isHost, onStartGame }: WaitingRoomProps) {
  const quizTitle = typeof game.quiz === 'object' ? game.quiz.title : 'Quiz Session';
  const category = typeof game.quiz === 'object' ? game.quiz.category : 'General';
  const questionCount = typeof game.quiz === 'object' ? game.quiz.questions.length : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Game Details Banner */}
      <Card className="p-6 bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="text-center md:text-left relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/30">
            Lobby Mode: {game.gameMode}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white mt-3">
            {quizTitle}
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-sans">
            Category: <span className="capitalize">{category}</span> • {questionCount} Questions
          </p>
        </div>

        {/* Start Game controls */}
        <div className="relative z-10 flex-shrink-0">
          {isHost ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onStartGame}
                disabled={players.length === 0}
                className="w-full md:w-auto px-8 py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <FiPlay className="text-xl" /> Start Gameplay
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-sm">
              <FiCpu className="animate-spin text-lg" />
              Waiting for host to start...
            </div>
          )}
        </div>
      </Card>

      {/* Main waiting area components grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Pin & QR Card */}
        <div className="md:col-span-1">
          <GamePin pin={game.pin} />
        </div>

        {/* Player List */}
        <div className="md:col-span-2">
          <PlayerList players={players} />
        </div>
      </div>
    </div>
  );
}
export default WaitingRoom;

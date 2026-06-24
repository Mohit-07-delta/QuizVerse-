'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPlay, FiStar, FiAward, FiBookOpen, FiClock } from 'react-icons/fi';
import type { Quiz } from '@/types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import Avatar from '../ui/Avatar';
import { getDifficultyColor, getCategoryIcon } from '@/lib/utils';

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const difficultyColor = getDifficultyColor(quiz.difficulty);
  const ratingValue = quiz.rating || 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col justify-between overflow-hidden relative group border border-purple-500/20 bg-dark-800/40 backdrop-blur-md">
        {/* Cover Image/Placeholder */}
        <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-purple-900/60 to-cyan-900/60 flex items-center justify-center">
          {quiz.coverImage ? (
            <img
              src={quiz.coverImage}
              alt={quiz.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 p-4">
              <span className="text-4xl mb-2">{getCategoryIcon(quiz.category)}</span>
              <span className="text-sm font-semibold capitalize font-heading">{quiz.category}</span>
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${difficultyColor} border-none uppercase text-[10px] font-bold tracking-wider px-2.5 py-1`}>
              {quiz.difficulty}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 flex-grow flex flex-col justify-between gap-y-4">
          <div className="flex flex-col gap-y-2">
            <h3 className="text-lg font-bold font-heading text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
              {quiz.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 font-sans">
              {quiz.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-col gap-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-x-2 py-3 border-t border-b border-purple-500/10 text-xs text-gray-400">
              <div className="flex items-center gap-x-1.5 justify-center">
                <FiPlay className="text-cyan-400" />
                <span>{quiz.plays} plays</span>
              </div>
              <div className="flex items-center gap-x-1.5 justify-center">
                <FiStar className="text-orange-400 fill-orange-400/20" />
                <span>{ratingValue.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-x-1.5 justify-center">
                <FiBookOpen className="text-purple-400" />
                <span>{quiz.questions?.length || 0} Qs</span>
              </div>
            </div>

            {/* Creator & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <Avatar
                  name={typeof quiz.creator === 'object' ? quiz.creator.name : 'Creator'}
                  src={typeof quiz.creator === 'object' ? quiz.creator.avatar : undefined}
                  size="sm"
                />
                <span className="text-xs text-gray-400 truncate max-w-[80px]">
                  {typeof quiz.creator === 'object' ? quiz.creator.name : 'Creator'}
                </span>
              </div>

              <Link href={`/game/create?quizId=${quiz.id || quiz._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white flex items-center gap-x-1.5 shadow-lg shadow-purple-500/20"
                >
                  <FiPlay /> Host Game
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

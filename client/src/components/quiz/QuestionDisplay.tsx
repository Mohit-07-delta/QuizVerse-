'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/types';
import { Card } from '../ui/Card';

interface QuestionDisplayProps {
  question: Question;
  index: number;
  total: number;
}

export function QuestionDisplay({ question, index, total }: QuestionDisplayProps) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold uppercase tracking-wider text-purple-400 font-heading">
          Question {index + 1} of {total}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/15 border border-purple-500/35 text-purple-300">
          {question.difficulty}
        </span>
      </div>

      <Card className="p-8 text-center bg-dark-800/40 border border-purple-500/10 backdrop-blur-md relative overflow-hidden mb-6">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white leading-snug relative z-10">
          {question.text}
        </h2>

        {/* Question Image */}
        {question.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-h-64 md:max-h-80 w-full overflow-hidden rounded-xl border border-purple-500/20 shadow-2xl relative z-10 flex justify-center bg-dark-900"
          >
            <img
              src={question.imageUrl}
              alt="Question Visual"
              className="object-contain max-h-64 md:max-h-80 w-auto"
            />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

'use client';

import React from 'react';
import type { Difficulty } from '@/types';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex gap-2">
      {(['easy', 'medium', 'hard'] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`flex-1 py-2 px-4 text-xs font-bold rounded-lg border capitalize tracking-wider transition-all duration-200 ${
            value === d
              ? d === 'easy'
                ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20'
                : d === 'medium'
                ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20'
              : 'bg-dark-900 border-purple-500/10 text-gray-400 hover:text-white'
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
export default DifficultySelector;

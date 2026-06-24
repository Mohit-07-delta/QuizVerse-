'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTriangle, FiSquare, FiOctagon, FiCircle, FiCheck, FiX } from 'react-icons/fi';

interface AnswerButtonProps {
  index: number;
  text: string;
  isSelected: boolean;
  isDisabled: boolean;
  isCorrectRevealed?: boolean;
  isWrongRevealed?: boolean;
  onClick: () => void;
}

export function AnswerButton({
  index,
  text,
  isSelected,
  isDisabled,
  isCorrectRevealed,
  isWrongRevealed,
  onClick,
}: AnswerButtonProps) {
  // Define vibrant colors & shapes like Kahoot
  const styleConfigs = [
    {
      bg: 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/10 focus:ring-red-500/50',
      activeBorder: 'border-red-400',
      icon: <FiTriangle className="text-xl fill-current" />,
      glow: 'shadow-lg shadow-red-500/20',
    },
    {
      bg: 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/10 focus:ring-blue-500/50',
      activeBorder: 'border-blue-400',
      icon: <FiCircle className="text-xl stroke-[3px]" />,
      glow: 'shadow-lg shadow-blue-500/20',
    },
    {
      bg: 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-yellow-500/10 focus:ring-yellow-500/50',
      activeBorder: 'border-yellow-400',
      icon: <FiCircle className="text-xl fill-current" />, // square shape fallback
      glow: 'shadow-lg shadow-yellow-500/20',
    },
    {
      bg: 'bg-green-500 hover:bg-green-400 text-white shadow-green-500/10 focus:ring-green-500/50',
      activeBorder: 'border-green-400',
      icon: <FiSquare className="text-xl fill-current" />,
      glow: 'shadow-lg shadow-green-500/20',
    },
  ];

  const config = styleConfigs[index % styleConfigs.length];

  let buttonClass = `${config.bg} ${config.glow} border-2 border-transparent`;
  
  if (isSelected) {
    buttonClass = `${config.bg} ${config.glow} border-2 ${config.activeBorder} scale-[1.02]`;
  }

  // Answer reveals state styling
  if (isCorrectRevealed) {
    buttonClass = 'bg-green-600 border-2 border-green-400 text-white shadow-lg shadow-green-500/30';
  } else if (isWrongRevealed) {
    buttonClass = 'bg-red-600 border-2 border-red-400 text-white shadow-lg shadow-red-500/30';
  } else if (isDisabled && !isSelected) {
    buttonClass = 'bg-dark-800/40 border border-purple-500/10 text-gray-500 cursor-not-allowed';
  }

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.015, y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      disabled={isDisabled}
      onClick={onClick}
      className={`w-full p-5 md:p-6 rounded-xl flex items-center justify-between transition-all duration-200 outline-none text-left min-h-[76px] font-heading font-bold text-lg md:text-xl shadow-lg relative ${buttonClass}`}
    >
      <div className="flex items-center gap-4">
        {/* Render different shapes based on option index */}
        {!isCorrectRevealed && !isWrongRevealed && (
          <div className="opacity-80 flex-shrink-0">
            {index === 0 && <FiTriangle className="text-xl md:text-2xl fill-current" />}
            {index === 1 && <FiCircle className="text-xl md:text-2xl stroke-[3px]" />}
            {index === 2 && <FiSquare className="text-xl md:text-2xl fill-current rotate-45" />}
            {index === 3 && <FiSquare className="text-xl md:text-2xl fill-current" />}
          </div>
        )}
        
        {isCorrectRevealed && <FiCheck className="text-2xl flex-shrink-0 text-white" />}
        {isWrongRevealed && <FiX className="text-2xl flex-shrink-0 text-white" />}

        <span className="line-clamp-2 leading-tight">{text}</span>
      </div>

      {isSelected && !isCorrectRevealed && !isWrongRevealed && (
        <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded">
          Selected
        </span>
      )}
    </motion.button>
  );
}
export default AnswerButton;

'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TimerProps {
  timeLeft: number;
  duration: number;
}

export function Timer({ timeLeft, duration }: TimerProps) {
  const radius = 35;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / duration) * circumference;

  const controls = useAnimation();

  useEffect(() => {
    // Pulse animation during the last 5 seconds
    if (timeLeft <= 5 && timeLeft > 0) {
      controls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.5, repeat: 1, ease: 'easeInOut' },
      });
    }
  }, [timeLeft, controls]);

  // Determine circle color based on time remaining
  let strokeColor = 'stroke-cyan-500';
  let textColor = 'text-cyan-400';
  let glowColor = 'drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]';

  if (timeLeft <= duration * 0.25) {
    strokeColor = 'stroke-red-500';
    textColor = 'text-red-400';
    glowColor = 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  } else if (timeLeft <= duration * 0.5) {
    strokeColor = 'stroke-yellow-500';
    textColor = 'text-yellow-400';
    glowColor = 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]';
  }

  return (
    <div className="flex items-center justify-center relative w-20 h-20">
      <svg className="w-full h-full -rotate-90">
        {/* Track circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-purple-900/25 fill-transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          strokeWidth={strokeWidth}
          className={`${strokeColor} ${glowColor} fill-transparent transition-all duration-300`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Time display */}
      <motion.div
        animate={controls}
        className={`absolute font-heading font-bold text-2xl ${textColor} ${glowColor} font-mono`}
      >
        {timeLeft}
      </motion.div>
    </div>
  );
}
export default Timer;

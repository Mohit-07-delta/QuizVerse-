'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiTarget } from 'react-icons/fi';

interface ScorePopupProps {
  isVisible: boolean;
  isCorrect: boolean;
  pointsEarned: number;
  streak: number;
  combo: number;
}

export function ScorePopup({
  isVisible,
  isCorrect,
  pointsEarned,
  streak,
  combo,
}: ScorePopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            className={`p-8 rounded-2xl max-w-sm w-full text-center border shadow-2xl relative overflow-hidden ${
              isCorrect
                ? 'bg-green-950/60 border-green-500/30 text-green-300'
                : 'bg-red-950/60 border-red-500/30 text-red-300'
            }`}
          >
            {/* Glowing background accent */}
            <div
              className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl ${
                isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            />

            {/* Icon */}
            <div className="relative z-10 flex justify-center mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                  isCorrect
                    ? 'border-green-400 bg-green-500/10 text-green-400'
                    : 'border-red-400 bg-red-500/10 text-red-400'
                }`}
              >
                {isCorrect ? (
                  <FiCheck className="text-3xl stroke-[3px]" />
                ) : (
                  <FiX className="text-3xl stroke-[3px]" />
                )}
              </div>
            </div>

            {/* Header message */}
            <h3 className="text-2xl font-bold font-heading mb-2 text-white relative z-10">
              {isCorrect ? 'Correct Answer!' : 'Incorrect'}
            </h3>

            {/* Points and streaks details */}
            <div className="relative z-10 space-y-4 my-6">
              {isCorrect ? (
                <>
                  <div className="flex items-center justify-center gap-1.5 text-3xl font-extrabold font-heading text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    +{pointsEarned} <span className="text-lg">pts</span>
                  </div>

                  {streak > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 border border-orange-500/30 text-orange-400">
                      <FiZap className="fill-current animate-pulse" />
                      STREAK: {streak} Game{streak > 1 ? 's' : ''}
                    </div>
                  )}

                  {combo > 1 && (
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-yellow-400 mt-2">
                      <FiTarget /> Combo Multiplier: x{combo.toFixed(1)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 font-sans">
                  Keep learning! Review the explanation in the leaderboard results.
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 font-sans relative z-10">
              Waiting for host to continue...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default ScorePopup;

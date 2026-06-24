'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  target?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'cyan' | 'green' | 'pink';
}

export default function ProgressBar({
  value,
  max,
  target,
  label,
  showValue = true,
  size = 'md',
  className,
  color = 'primary',
}: ProgressBarProps) {
  const finalMax = max || target || 100;
  const percentage = finalMax > 0 ? Math.min((value / finalMax) * 100, 100) : 0;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const gradients = {
    primary: 'from-primary-500 to-accent-cyan',
    cyan: 'from-accent-cyan to-accent-green',
    green: 'from-accent-green to-emerald-400',
    pink: 'from-accent-pink to-primary-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-dark-200">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-dark-300">
              {value} / {finalMax}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-dark-700 overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r relative',
            gradients[color]
          )}
        >
          {size === 'lg' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export { ProgressBar };

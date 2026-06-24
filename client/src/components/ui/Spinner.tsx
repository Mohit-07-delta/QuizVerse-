'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent animate-spin',
          size === 'sm' ? 'border-t-primary-500' : 'border-t-primary-500 border-r-accent-cyan'
        )}
      />
      <div
        className={cn(
          'absolute inset-1 rounded-full border-2 border-transparent animate-spin',
          size !== 'sm' && 'border-b-accent-pink'
        )}
        style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
      />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-dark-300 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export { Spinner };

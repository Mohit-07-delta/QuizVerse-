'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({ variant = 'default', size = 'sm', children, className, icon }: BadgeProps) {
  const variants = {
    success: 'bg-accent-green/15 text-accent-green border-accent-green/25',
    warning: 'bg-accent-orange/15 text-accent-orange border-accent-orange/25',
    error: 'bg-accent-red/15 text-accent-red border-accent-red/25',
    info: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25',
    purple: 'bg-primary-500/15 text-primary-400 border-primary-500/25',
    default: 'bg-white/5 text-dark-200 border-white/10',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-lg border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export { Badge };

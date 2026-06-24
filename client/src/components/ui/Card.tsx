'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'gradient' | 'glow';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  variant = 'default',
  hover = true,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'glass-card',
    gradient: 'glass-card gradient-border',
    glow: 'glass-card animate-pulse-glow',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(baseStyles, variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { Card };

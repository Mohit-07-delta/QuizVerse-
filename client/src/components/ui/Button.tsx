'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiLoader } from 'react-icons/fi';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
      primary: 'bg-gradient-to-r from-primary-500 to-accent-cyan text-white hover:shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:brightness-110',
      secondary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-[0_8px_30px_rgba(139,92,246,0.3)]',
      danger: 'bg-gradient-to-r from-accent-red to-red-600 text-white hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)]',
      ghost: 'bg-transparent text-dark-200 hover:text-white hover:bg-white/5',
      glass: 'glass text-white hover:bg-white/10',
    };

    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-sm px-6 py-3',
      lg: 'text-base px-8 py-4',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        <span className="relative z-10">{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export default Button;

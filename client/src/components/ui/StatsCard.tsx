'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatsCardProps {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  className?: string;
  delay?: number;
}

export default function StatsCard({ icon, label, title, value, trend, className, delay = 0 }: StatsCardProps) {
  const finalLabel = label || title || '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        'glass-card p-6 rounded-2xl group cursor-default flex flex-col gap-y-3',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 transition-colors">
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
              trend.isUp
                ? 'text-accent-green bg-accent-green/10'
                : 'text-accent-red bg-accent-red/10'
            )}
          >
            {trend.isUp ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="text-2xl font-bold font-heading">{value}</p>
        <p className="text-sm text-dark-300">{finalLabel}</p>
      </div>
    </motion.div>
  );
}

export { StatsCard };

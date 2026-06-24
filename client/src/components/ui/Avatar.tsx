'use client';

import { cn, getAvatarUrl } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

export default function Avatar({ src, name, size = 'md', online, className }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const onlineIndicators = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const imageUrl = getAvatarUrl(src, name);

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <img
        src={imageUrl}
        alt={name || 'Avatar'}
        className={cn(
          sizes[size],
          'rounded-xl object-cover ring-2 ring-white/10'
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        className={cn(
          sizes[size],
          'rounded-xl gradient-primary items-center justify-center text-white font-bold hidden'
        )}
        style={{ fontSize: size === 'xs' ? '0.5rem' : size === 'sm' ? '0.625rem' : '0.75rem' }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-dark-900',
            onlineIndicators[size],
            online ? 'bg-accent-green' : 'bg-dark-400'
          )}
        />
      )}
    </div>
  );
}

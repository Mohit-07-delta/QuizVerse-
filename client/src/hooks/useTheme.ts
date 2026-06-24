'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem('quizverse_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'dark'); // Default dark
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}

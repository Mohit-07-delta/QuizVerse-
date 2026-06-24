'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem('quizverse_theme') as 'dark' | 'light' | null;
    const theme = saved || 'dark';
    setTheme(theme);
  }, [setTheme]);

  return <>{children}</>;
}

export { ThemeProvider };

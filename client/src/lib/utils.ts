import { clsx, type ClassValue } from 'clsx';
import type { Difficulty, QuizCategory } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function getAvatarUrl(avatar?: string, name?: string): string {
  if (avatar && avatar.startsWith('http')) return avatar;
  const seed = avatar || name || 'default';
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'text-accent-green';
    case 'medium': return 'text-accent-orange';
    case 'hard': return 'text-accent-red';
    default: return 'text-dark-300';
  }
}

export function getDifficultyBg(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'bg-accent-green/20 text-accent-green border-accent-green/30';
    case 'medium': return 'bg-accent-orange/20 text-accent-orange border-accent-orange/30';
    case 'hard': return 'bg-accent-red/20 text-accent-red border-accent-red/30';
    default: return 'bg-dark-500/20 text-dark-300';
  }
}

export function getCategoryIcon(category: QuizCategory): string {
  const icons: Record<QuizCategory, string> = {
    general: '🎯',
    science: '🔬',
    history: '📜',
    geography: '🌍',
    technology: '💻',
    mathematics: '📐',
    literature: '📚',
    arts: '🎨',
    sports: '⚽',
    entertainment: '🎬',
    nature: '🌿',
    politics: '🏛️',
    philosophy: '🤔',
    music: '🎵',
    food: '🍕',
    language: '🗣️',
    custom: '✨',
  };
  return icons[category] || '🎯';
}

export function getCategoryLabel(category: QuizCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getStreakText(streak: number): string {
  if (streak >= 10) return '🔥 UNSTOPPABLE!';
  if (streak >= 7) return '🔥 On Fire!';
  if (streak >= 5) return '⚡ Impressive!';
  if (streak >= 3) return '✨ Nice Streak!';
  return '';
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function calculatePoints(
  isCorrect: boolean,
  timeMs: number,
  totalTimeMs: number,
  streak: number,
  difficulty: Difficulty
): number {
  if (!isCorrect) return 0;

  const basePoints = difficulty === 'easy' ? 500 : difficulty === 'medium' ? 750 : 1000;
  const timeBonus = Math.round((1 - timeMs / totalTimeMs) * 500);
  const streakMultiplier = 1 + Math.min(streak, 5) * 0.1;

  return Math.round((basePoints + Math.max(0, timeBonus)) * streakMultiplier);
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidWikipediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('wikipedia.org');
  } catch {
    return false;
  }
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export const AVATAR_OPTIONS = [
  'felix', 'aneka', 'luna', 'zephyr', 'nova', 'echo',
  'blaze', 'frost', 'spark', 'storm', 'pixel', 'orbit',
  'comet', 'sage', 'jade', 'ruby', 'onyx', 'pearl',
  'atlas', 'cosmos', 'nebula', 'vortex', 'zenith', 'prism',
];

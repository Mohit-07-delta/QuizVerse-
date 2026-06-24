/**
 * Scoring Engine for QuizVerse AI
 *
 * Base points: 1000
 * Time bonus: remaining time / total time (faster = more points)
 * Streak multiplier: 1 + streak * 0.1, capped at 2x
 * Combo multiplier: increases every 3 consecutive correct answers (1x, 1.5x, 2x, 2.5x, max 3x)
 */

export interface ScoreResult {
  points: number;
  timeBonus: number;
  streakMultiplier: number;
  comboMultiplier: number;
  breakdown: {
    basePoints: number;
    timeBonusPoints: number;
    streakBonusPoints: number;
    comboBonusPoints: number;
  };
}

const BASE_POINTS = 1000;
const MAX_STREAK_MULTIPLIER = 2.0;
const MAX_COMBO_MULTIPLIER = 3.0;

export function calculatePoints(
  isCorrect: boolean,
  timeTaken: number,
  maxTime: number,
  streak: number,
  combo: number
): ScoreResult {
  if (!isCorrect) {
    return {
      points: 0,
      timeBonus: 0,
      streakMultiplier: 1,
      comboMultiplier: 1,
      breakdown: {
        basePoints: 0,
        timeBonusPoints: 0,
        streakBonusPoints: 0,
        comboBonusPoints: 0,
      },
    };
  }

  // Time bonus: ratio of remaining time to total time
  const effectiveTimeTaken = Math.max(0, Math.min(timeTaken, maxTime));
  const timeRemaining = maxTime - effectiveTimeTaken;
  const timeBonus = timeRemaining / maxTime;

  // Streak multiplier: 1 + streak * 0.1, max 2x
  const streakMultiplier = Math.min(1 + streak * 0.1, MAX_STREAK_MULTIPLIER);

  // Combo multiplier
  const comboMultiplier = Math.min(combo, MAX_COMBO_MULTIPLIER);

  // Calculate component points
  const basePoints = BASE_POINTS;
  const timeBonusPoints = Math.round(basePoints * timeBonus);
  const withTimeBonus = timeBonusPoints;
  const streakBonusPoints = Math.round(withTimeBonus * (streakMultiplier - 1));
  const comboBonusPoints = Math.round(withTimeBonus * (comboMultiplier - 1));

  const totalPoints = Math.round(
    withTimeBonus * streakMultiplier * comboMultiplier
  );

  return {
    points: totalPoints,
    timeBonus,
    streakMultiplier,
    comboMultiplier,
    breakdown: {
      basePoints,
      timeBonusPoints,
      streakBonusPoints,
      comboBonusPoints,
    },
  };
}

export function calculateXP(
  score: number,
  questionsCorrect: number,
  totalQuestions: number
): number {
  const scoreXP = Math.round(score / 10);
  const correctBonus = questionsCorrect * 10;
  const completionBonus = totalQuestions > 0 ? 50 : 0; // bonus for completing the quiz
  const perfectBonus =
    totalQuestions > 0 && questionsCorrect === totalQuestions ? 100 : 0;

  return scoreXP + correctBonus + completionBonus + perfectBonus;
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 1000) + 1;
}

export function getStreakMultiplier(streak: number): {
  multiplier: number;
  text: string;
} {
  const multiplier = Math.min(1 + streak * 0.1, MAX_STREAK_MULTIPLIER);

  if (streak === 0) return { multiplier: 1, text: "No streak" };
  if (streak < 3) return { multiplier, text: `${streak} streak! ${multiplier}x` };
  if (streak < 5) return { multiplier, text: `🔥 ${streak} streak! ${multiplier}x` };
  if (streak < 10) return { multiplier, text: `🔥🔥 ${streak} streak! ${multiplier}x` };
  return { multiplier, text: `🔥🔥🔥 ${streak} streak! ${multiplier.toFixed(1)}x` };
}

export function getComboMultiplier(consecutiveCorrect: number): {
  multiplier: number;
  level: number;
  text: string;
} {
  // Combo level increases every 3 consecutive correct answers
  const comboLevel = Math.floor(consecutiveCorrect / 3);

  let multiplier: number;
  let text: string;

  switch (comboLevel) {
    case 0:
      multiplier = 1.0;
      text = "No combo";
      break;
    case 1:
      multiplier = 1.5;
      text = "Combo x1.5!";
      break;
    case 2:
      multiplier = 2.0;
      text = "Super Combo x2!";
      break;
    case 3:
      multiplier = 2.5;
      text = "Ultra Combo x2.5!";
      break;
    default:
      multiplier = 3.0;
      text = "MAX COMBO x3! 💥";
      break;
  }

  return { multiplier, level: comboLevel, text };
}

export function getRankTitle(level: number): string {
  if (level < 5) return "Novice";
  if (level < 10) return "Apprentice";
  if (level < 20) return "Scholar";
  if (level < 30) return "Expert";
  if (level < 50) return "Master";
  if (level < 75) return "Grandmaster";
  return "Legend";
}

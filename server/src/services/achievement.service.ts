import prisma from "../lib/prisma.js";
import type { AchievementContext } from "../types/index.js";

interface AchievementDef {
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
  category: string;
  check: (context: AchievementContext) => boolean;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    name: "First Quiz",
    description: "Play your first quiz game",
    icon: "🎮",
    xpReward: 50,
    condition: "Play 1 quiz game",
    category: "gameplay",
    check: (ctx) => (ctx.totalGamesPlayed ?? 0) >= 1,
  },
  {
    name: "Quiz Master",
    description: "Play 10 quiz games",
    icon: "🏆",
    xpReward: 200,
    condition: "Play 10 quiz games",
    category: "gameplay",
    check: (ctx) => (ctx.totalGamesPlayed ?? 0) >= 10,
  },
  {
    name: "Perfect Score",
    description: "Get 100% accuracy in a quiz",
    icon: "💯",
    xpReward: 300,
    condition: "100% accuracy in a quiz",
    category: "performance",
    check: (ctx) => ctx.perfectScore === true,
  },
  {
    name: "Speed Demon",
    description: "Answer a question in under 3 seconds",
    icon: "⚡",
    xpReward: 100,
    condition: "Answer in under 3 seconds",
    category: "performance",
    check: (ctx) => (ctx.fastestAnswer ?? Infinity) < 3,
  },
  {
    name: "Streak King",
    description: "Achieve a 10-question answer streak",
    icon: "🔥",
    xpReward: 250,
    condition: "10 consecutive correct answers",
    category: "performance",
    check: (ctx) => (ctx.currentStreak ?? 0) >= 10,
  },
  {
    name: "Social Butterfly",
    description: "Make 5 friends on the platform",
    icon: "🦋",
    xpReward: 150,
    condition: "Have 5 friends",
    category: "social",
    check: (ctx) => (ctx.friendCount ?? 0) >= 5,
  },
  {
    name: "Quiz Creator",
    description: "Create 5 quizzes",
    icon: "✍️",
    xpReward: 200,
    condition: "Create 5 quizzes",
    category: "creation",
    check: (ctx) => (ctx.quizzesCreated ?? 0) >= 5,
  },
  {
    name: "Wikipedia Scholar",
    description: "Play 5 quizzes generated from Wikipedia",
    icon: "📚",
    xpReward: 200,
    condition: "Play 5 Wikipedia-sourced quizzes",
    category: "exploration",
    check: (ctx) => (ctx.wikiQuizzesPlayed ?? 0) >= 5,
  },
];

export async function ensureAchievementsExist(): Promise<void> {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { name: def.name },
      update: {
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
        condition: def.condition,
        category: def.category,
      },
      create: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
        condition: def.condition,
        category: def.category,
      },
    });
  }
}

export async function checkAchievements(
  userId: string,
  context: AchievementContext
): Promise<Array<{ name: string; description: string; icon: string; xpReward: number }>> {
  const unlockedAchievements: Array<{
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  }> = [];

  // Get already unlocked achievements for this user
  const existingUnlocks = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  const unlockedNames = new Set(existingUnlocks.map((u) => u.achievement.name));

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // Skip already unlocked
    if (unlockedNames.has(def.name)) continue;

    // Check condition
    if (!def.check(context)) continue;

    // Find achievement in DB
    const achievement = await prisma.achievement.findUnique({
      where: { name: def.name },
    });

    if (!achievement) continue;

    // Unlock it
    try {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP
      if (def.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: def.xpReward },
          },
        });
      }

      unlockedAchievements.push({
        name: def.name,
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
      });
    } catch {
      // Ignore duplicate — race condition safety
    }
  }

  return unlockedAchievements;
}

export async function getUserAchievements(userId: string) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });

  // Get all achievements to show locked ones too
  const allAchievements = await prisma.achievement.findMany();

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  return {
    unlocked: userAchievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      xpReward: ua.achievement.xpReward,
      category: ua.achievement.category,
      unlockedAt: ua.unlockedAt,
    })),
    locked: allAchievements
      .filter((a) => !unlockedIds.has(a.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        condition: a.condition,
        category: a.category,
      })),
    total: allAchievements.length,
    unlockedCount: userAchievements.length,
  };
}

import prisma from "../lib/prisma.js";
import type { LeaderboardPeriod } from "@prisma/client";

export async function updateLeaderboard(
  userId: string,
  score: number,
  period: LeaderboardPeriod
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, avatar: true },
  });

  if (!user) return;

  // Upsert — create or update if new score is higher
  const existing = await prisma.leaderboardEntry.findUnique({
    where: {
      userId_period_category: {
        userId,
        period,
        category: "general",
      },
    },
  });

  if (existing) {
    // Only update if score is higher
    if (score > existing.score) {
      await prisma.leaderboardEntry.update({
        where: { id: existing.id },
        data: {
          score,
          userName: user.name,
          userAvatar: user.avatar,
        },
      });
    }
  } else {
    await prisma.leaderboardEntry.create({
      data: {
        userId,
        userName: user.name,
        userAvatar: user.avatar,
        score,
        period,
        category: "general",
      },
    });
  }
}

export async function updateAllLeaderboards(
  userId: string,
  score: number
): Promise<void> {
  const periods: LeaderboardPeriod[] = ["WEEKLY", "MONTHLY", "ALL_TIME"];
  await Promise.all(periods.map((period) => updateLeaderboard(userId, score, period)));
}

export async function getLeaderboard(
  period: LeaderboardPeriod,
  limit: number = 50,
  category: string = "general"
): Promise<
  Array<{
    rank: number;
    userId: string;
    userName: string;
    userAvatar: string;
    score: number;
  }>
> {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { period, category },
    orderBy: { score: "desc" },
    take: limit,
  });

  return entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    userName: entry.userName,
    userAvatar: entry.userAvatar,
    score: entry.score,
  }));
}

export async function getUserRank(
  userId: string,
  period: LeaderboardPeriod,
  category: string = "general"
): Promise<{ rank: number; score: number } | null> {
  const userEntry = await prisma.leaderboardEntry.findUnique({
    where: {
      userId_period_category: {
        userId,
        period,
        category,
      },
    },
  });

  if (!userEntry) return null;

  // Count how many entries have a higher score
  const higherCount = await prisma.leaderboardEntry.count({
    where: {
      period,
      category,
      score: { gt: userEntry.score },
    },
  });

  return {
    rank: higherCount + 1,
    score: userEntry.score,
  };
}

export async function resetWeeklyLeaderboard(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany({
    where: { period: "WEEKLY" },
  });
}

export async function resetMonthlyLeaderboard(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany({
    where: { period: "MONTHLY" },
  });
}

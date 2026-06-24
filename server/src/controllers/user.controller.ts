import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { calculateLevel } from "../services/scoring.service.js";

// ─── Get Profile ──────────────────────────────────────────────────────────────

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req.params.id || req.user?.userId) as string;
    if (!userId) {
      throw new AppError("User ID is required.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        xp: true,
        level: true,
        streakDays: true,
        createdAt: true,
        _count: {
          select: {
            quizzes: true,
            hostedGames: true,
            achievements: true,
          },
        },
      },
    }) as any;

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Get recent analytics for stats
    const analytics = await prisma.analytics.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalGames = analytics.length;
    const totalCorrect = analytics.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalQuestions = analytics.reduce((sum, a) => sum + a.totalQuestions, 0);
    const averageAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalScore = analytics.reduce((sum, a) => sum + a.score, 0);

    // Calculate XP progress to next level
    const currentLevel = calculateLevel(user.xp);
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    const xpProgress = user.xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          quizzesCreated: user._count.quizzes,
          gamesHosted: user._count.hostedGames,
          achievementsUnlocked: user._count.achievements,
          totalGamesPlayed: totalGames,
          totalCorrectAnswers: totalCorrect,
          totalQuestions,
          averageAccuracy,
          totalScore,
        },
        levelProgress: {
          level: currentLevel,
          xp: user.xp,
          xpProgress,
          xpNeeded,
          percentage: Math.round((xpProgress / xpNeeded) * 100),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { name, avatar } = req.body;
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 2 || name.length > 50) {
        throw new AppError("Name must be between 2 and 50 characters.", 400);
      }
      updateData.name = name;
    }

    if (avatar !== undefined) {
      if (typeof avatar !== "string") {
        throw new AppError("Avatar must be a string.", 400);
      }
      updateData.avatar = avatar;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update.", 400);
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        xp: true,
        level: true,
        streakDays: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Analytics ────────────────────────────────────────────────────────────

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const page = Math.max(1, parseInt(req.query.page as any) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as any) || 20));
    const category = (req.query.category as string) || "";

    const where: any = { userId: req.user.userId };
    if (category) where.category = category;

    const [analytics, total] = await Promise.all([
      prisma.analytics.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.analytics.count({ where }),
    ]);

    // Aggregate stats
    const allAnalytics = await prisma.analytics.findMany({
      where: { userId: req.user.userId },
    });

    const totalGames = allAnalytics.length;
    const totalCorrect = allAnalytics.reduce((s, a) => s + a.correctAnswers, 0);
    const totalQuestions = allAnalytics.reduce((s, a) => s + a.totalQuestions, 0);
    const totalScore = allAnalytics.reduce((s, a) => s + a.score, 0);
    const averageAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

    // Category breakdown
    const categoryMap = new Map<string, { games: number; avgAccuracy: number }>();
    for (const a of allAnalytics) {
      const entry = categoryMap.get(a.category) || { games: 0, avgAccuracy: 0 };
      entry.games += 1;
      entry.avgAccuracy += a.accuracy;
      categoryMap.set(a.category, entry);
    }
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([cat, data]) => ({
      category: cat,
      games: data.games,
      averageAccuracy: Math.round(data.avgAccuracy / data.games),
    }));

    res.json({
      success: true,
      data: {
        history: analytics,
        summary: {
          totalGames,
          totalCorrect,
          totalQuestions,
          totalScore,
          averageAccuracy,
          averageScore,
        },
        categoryBreakdown,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Achievements ─────────────────────────────────────────────────────────

export async function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { getUserAchievements } = await import(
      "../services/achievement.service.js"
    );
    const achievements = await getUserAchievements(req.user.userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    next(error);
  }
}

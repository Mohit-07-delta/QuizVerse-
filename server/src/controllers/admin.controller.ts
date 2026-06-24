import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get Users (Admin) ────────────────────────────────────────────────────────

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as any) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as any) || 20));
    const search = (req.query.search as string) || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          xp: true,
          level: true,
          streakDays: true,
          createdAt: true,
          _count: {
            select: { quizzes: true, hostedGames: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
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

// ─── Get Dashboard Stats (Admin) ─────────────────────────────────────────────

export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalUsers,
      totalQuizzes,
      totalGames,
      activeGames,
      totalAnalytics,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.quiz.count(),
      prisma.game.count(),
      prisma.game.count({ where: { status: { in: ["WAITING", "IN_PROGRESS"] } } }),
      prisma.analytics.count(),
    ]);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Recent games (last 7 days)
    const recentGames = await prisma.game.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Top quizzes by plays
    const topQuizzes = await prisma.quiz.findMany({
      orderBy: { plays: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        category: true,
        plays: true,
        rating: true,
        creator: {
          select: { name: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalQuizzes,
          totalGames,
          activeGames,
          totalGamesPlayed: totalAnalytics,
          recentSignups,
          recentGames,
        },
        topQuizzes,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Delete User (Admin) ─────────────────────────────────────────────────────

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = id as string;

    if (req.user?.userId === userId) {
      throw new AppError("You cannot delete your own admin account.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Delete Quiz (Admin) ─────────────────────────────────────────────────────

export async function adminDeleteQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const quizId = id as string;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({
      success: true,
      message: "Quiz deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Reports (Admin) ─────────────────────────────────────────────────────

export async function getReports(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Analytics aggregation for reporting
    const allAnalytics = await prisma.analytics.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Category popularity
    const categoryCount = new Map<string, number>();
    for (const a of allAnalytics) {
      categoryCount.set(a.category, (categoryCount.get(a.category) || 0) + 1);
    }

    const categoryPopularity = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, gamesPlayed: count }))
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

    // Average accuracy by category
    const categoryAccuracy = new Map<string, { total: number; count: number }>();
    for (const a of allAnalytics) {
      const entry = categoryAccuracy.get(a.category) || { total: 0, count: 0 };
      entry.total += a.accuracy;
      entry.count += 1;
      categoryAccuracy.set(a.category, entry);
    }

    const accuracyByCategory = Array.from(categoryAccuracy.entries()).map(
      ([category, data]) => ({
        category,
        averageAccuracy: Math.round(data.total / data.count),
        gamesPlayed: data.count,
      })
    );

    res.json({
      success: true,
      data: {
        categoryPopularity,
        accuracyByCategory,
        totalGamesAnalyzed: allAnalytics.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

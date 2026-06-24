import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler.js";
import * as leaderboardService from "../services/leaderboard.service.js";
import type { LeaderboardPeriod } from "@prisma/client";

// ─── Get Leaderboard ──────────────────────────────────────────────────────────

export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const periodParam = ((req.query.period as string) || "ALL_TIME").toUpperCase();
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

    const validPeriods: LeaderboardPeriod[] = ["WEEKLY", "MONTHLY", "ALL_TIME"];
    if (!validPeriods.includes(periodParam as LeaderboardPeriod)) {
      throw new AppError(
        "Invalid period. Must be WEEKLY, MONTHLY, or ALL_TIME.",
        400
      );
    }

    const period = periodParam as LeaderboardPeriod;

    const leaderboard = await leaderboardService.getLeaderboard(period, limit);

    // If user is authenticated, get their rank too
    let userRank: { rank: number; score: number } | null = null;
    if (req.user) {
      userRank = await leaderboardService.getUserRank(req.user.userId, period);
    }

    res.json({
      success: true,
      data: {
        period,
        leaderboard,
        userRank,
      },
    });
  } catch (error) {
    next(error);
  }
}

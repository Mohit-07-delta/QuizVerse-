import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Validation Schemas ───────────────────────────────────────────────────────

export const createGameSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  mode: z
    .enum([
      "CLASSIC",
      "TEAM_BATTLE",
      "DUEL",
      "ELIMINATION",
      "BATTLE_ROYALE",
      "SPEED_CHALLENGE",
      "PRACTICE",
    ])
    .default("CLASSIC"),
  maxPlayers: z.number().int().min(1).max(100).default(50),
});

export const joinGameSchema = z.object({
  pin: z.string().min(1, "Game PIN is required"),
  nickname: z.string().min(1, "Nickname is required").max(30),
  avatar: z.string().default("avatar1"),
});

// ─── Generate unique PIN ──────────────────────────────────────────────────────

async function generateUniquePin(): Promise<string> {
  let pin: string;
  let exists: boolean;
  let attempts = 0;

  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    const existingGame = await prisma.game.findUnique({ where: { pin } });
    exists = existingGame !== null && existingGame.status !== "FINISHED";
    attempts++;
    if (attempts > 20) {
      throw new AppError("Could not generate a unique game PIN. Please try again.", 500);
    }
  } while (exists);

  return pin;
}

// ─── Create Game ──────────────────────────────────────────────────────────────

export async function createGame(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { quizId, mode, maxPlayers } = req.body;

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    if (quiz.questions.length === 0) {
      throw new AppError("Quiz has no questions.", 400);
    }

    const pin = await generateUniquePin();

    const game = await prisma.game.create({
      data: {
        quizId,
        hostId: req.user.userId,
        pin,
        mode: mode || "CLASSIC",
        maxPlayers: maxPlayers || 50,
        players: [],
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            questions: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Game created successfully.",
      data: {
        id: game.id,
        pin: game.pin,
        mode: game.mode,
        status: game.status,
        maxPlayers: game.maxPlayers,
        quiz: {
          id: game.quiz.id,
          title: game.quiz.title,
          category: game.quiz.category,
          difficulty: game.quiz.difficulty,
          questionCount: game.quiz.questions.length,
        },
        createdAt: game.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Game by PIN ──────────────────────────────────────────────────────────

export async function getGame(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pin } = req.params;
    const pinStr = pin as string;

    const game = (await prisma.game.findUnique({
      where: { pin: pinStr },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            coverImage: true,
            questions: {
              // Only return question count, not actual questions
            },
          },
        },
        host: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })) as any;

    if (!game) {
      throw new AppError("Game not found.", 404);
    }

    res.json({
      success: true,
      data: {
        id: game.id,
        pin: game.pin,
        mode: game.mode,
        status: game.status,
        currentQuestion: game.currentQuestion,
        maxPlayers: game.maxPlayers,
        playerCount: game.players.length,
        players: game.players.map((p: any) => ({
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.score,
          isConnected: p.isConnected,
        })),
        quiz: {
          id: game.quiz.id,
          title: game.quiz.title,
          category: game.quiz.category,
          difficulty: game.quiz.difficulty,
          coverImage: game.quiz.coverImage,
          questionCount: game.quiz.questions.length,
        },
        host: game.host,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Join Game (REST fallback — main join is via Socket) ──────────────────────

export async function joinGame(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pin, nickname, avatar } = req.body;

    const game = await prisma.game.findUnique({
      where: { pin },
      include: {
        quiz: {
          select: { id: true, title: true, questions: true },
        },
      },
    });

    if (!game) {
      throw new AppError("Game not found. Check the PIN and try again.", 404);
    }

    if (game.status === "FINISHED") {
      throw new AppError("This game has already ended.", 400);
    }

    if (game.status === "IN_PROGRESS") {
      throw new AppError("This game is already in progress.", 400);
    }

    if (game.players.length >= game.maxPlayers) {
      throw new AppError("This game is full.", 400);
    }

    // Check for duplicate nickname
    const nicknameTaken = game.players.some(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (nicknameTaken) {
      throw new AppError("Nickname is already taken in this game.", 409);
    }

    // Add player to game
    const updatedGame = await prisma.game.update({
      where: { pin },
      data: {
        players: {
          push: {
            userId: req.user?.userId || null,
            nickname,
            avatar: avatar || "avatar1",
            score: 0,
            streak: 0,
            bestStreak: 0,
            combo: 1,
            xpEarned: 0,
            answers: [],
            isConnected: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Joined game successfully.",
      data: {
        pin: updatedGame.pin,
        status: updatedGame.status,
        playerCount: updatedGame.players.length,
        quiz: {
          id: game.quiz.id,
          title: game.quiz.title,
          questionCount: game.quiz.questions.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

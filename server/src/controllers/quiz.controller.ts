import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MCQ", "TRUE_FALSE", "IMAGE"]),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
  timer: z.number().int().min(5).max(120).default(30),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  hints: z.array(z.string()).default([]),
  explanation: z.string().optional().nullable(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).default("MIXED"),
  isPublic: z.boolean().default(true),
  coverImage: z.string().url().optional().nullable(),
  questions: z.array(questionSchema).min(1, "At least 1 question is required"),
  tags: z.array(z.string()).default([]),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).optional(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().url().optional().nullable(),
  questions: z.array(questionSchema).min(1).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Create Quiz ──────────────────────────────────────────────────────────────

export async function createQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const {
      title,
      description,
      category,
      difficulty,
      isPublic,
      coverImage,
      questions,
      tags,
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        category,
        difficulty: difficulty || "MIXED",
        isPublic: isPublic !== false,
        coverImage: coverImage || null,
        questions: questions.map((q: z.infer<typeof questionSchema>) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageUrl || null,
          timer: q.timer || 30,
          difficulty: q.difficulty,
          hints: q.hints || [],
          explanation: q.explanation || null,
        })),
        tags: tags || [],
        creatorId: req.user.userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully.",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Quizzes (with search, pagination, filters) ──────────────────────────

export async function getQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const difficulty = (req.query.difficulty as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { isPublic: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty && ["EASY", "MEDIUM", "HARD", "MIXED"].includes(difficulty)) {
      where.difficulty = difficulty;
    }

    const orderBy: Record<string, string> = {};
    if (["createdAt", "plays", "rating", "title"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    // Strip correct answers from questions for public listing
    const sanitized = quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options,
        timer: q.timer,
        difficulty: q.difficulty,
        imageUrl: q.imageUrl,
      })),
      questionCount: quiz.questions.length,
    }));

    res.json({
      success: true,
      data: sanitized,
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

// ─── Get Single Quiz ──────────────────────────────────────────────────────────

export async function getQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const quizId = id as string;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz not found.", 404);
    }

    // If the requesting user is the creator, show full quiz; otherwise strip answers
    const isOwner = req.user?.userId === quiz.creatorId;

    const data = isOwner
      ? quiz
      : {
          ...quiz,
          questions: quiz.questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            timer: q.timer,
            difficulty: q.difficulty,
            imageUrl: q.imageUrl,
            hints: q.hints,
          })),
          questionCount: quiz.questions.length,
        };

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Update Quiz ──────────────────────────────────────────────────────────────

export async function updateQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { id } = req.params;
    const quizId = id as string;

    const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!existing) {
      throw new AppError("Quiz not found.", 404);
    }

    if (existing.creatorId !== req.user.userId && req.user.role !== "ADMIN") {
      throw new AppError("You can only update your own quizzes.", 403);
    }

    const updateData: Record<string, unknown> = {};
    const fields = [
      "title",
      "description",
      "category",
      "difficulty",
      "isPublic",
      "coverImage",
      "tags",
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (req.body.questions) {
      updateData.questions = req.body.questions.map(
        (q: z.infer<typeof questionSchema>) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageUrl || null,
          timer: q.timer || 30,
          difficulty: q.difficulty,
          hints: q.hints || [],
          explanation: q.explanation || null,
        })
      );
    }

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Quiz updated successfully.",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Delete Quiz ──────────────────────────────────────────────────────────────

export async function deleteQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { id } = req.params;
    const quizId = id as string;

    const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!existing) {
      throw new AppError("Quiz not found.", 404);
    }

    if (existing.creatorId !== req.user.userId && req.user.role !== "ADMIN") {
      throw new AppError("You can only delete your own quizzes.", 403);
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

// ─── Get My Quizzes ───────────────────────────────────────────────────────────

export async function getMyQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { creatorId: req.user.userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.quiz.count({ where: { creatorId: req.user.userId } }),
    ]);

    res.json({
      success: true,
      data: quizzes.map((q) => ({
        ...q,
        questionCount: q.questions.length,
      })),
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

// ─── Get Public Quizzes ───────────────────────────────────────────────────────

export async function getPublicQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const category = (req.query.category as string) || "";
    const sortBy = (req.query.sortBy as string) || "plays";

    const where: Record<string, unknown> = { isPublic: true };
    if (category) where.category = category;

    const orderBy: Record<string, string> = {};
    if (["plays", "rating", "createdAt"].includes(sortBy)) {
      orderBy[sortBy] = "desc";
    } else {
      orderBy.plays = "desc";
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    res.json({
      success: true,
      data: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        difficulty: q.difficulty,
        coverImage: q.coverImage,
        plays: q.plays,
        rating: q.rating,
        totalRatings: q.totalRatings,
        tags: q.tags,
        questionCount: q.questions.length,
        creator: q.creator,
        createdAt: q.createdAt,
      })),
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

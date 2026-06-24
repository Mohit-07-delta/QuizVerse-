import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import * as aiService from "../services/ai.service.js";

// ─── Validation Schemas ───────────────────────────────────────────────────────

export const generateFromTopicSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).default("MIXED"),
});

export const generateFromTextSchema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters").max(20000),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).default("MIXED"),
});

export const generateFromWikipediaSchema = z.object({
  url: z.string().min(1, "Wikipedia URL or article title is required"),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).default("MIXED"),
});

export const getHintSchema = z.object({
  question: z.string().min(1, "Question is required"),
  existingHints: z.array(z.string()).default([]),
});

export const getExplanationSchema = z.object({
  question: z.string().min(1, "Question is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  userAnswer: z.string().min(1, "User answer is required"),
});

// ─── Generate from Topic ──────────────────────────────────────────────────────

export async function generateFromTopic(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { topic, count, difficulty } = req.body;

    const questions = await aiService.generateFromTopic(
      topic,
      count || 5,
      difficulty || "MIXED"
    );

    res.json({
      success: true,
      message: `Generated ${questions.length} questions about "${topic}".`,
      data: {
        topic,
        questions,
        count: questions.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("API key")) {
      next(new AppError("AI service is not configured. Please set your OpenAI API key.", 503));
      return;
    }
    next(error);
  }
}

// ─── Generate from Text ───────────────────────────────────────────────────────

export async function generateFromText(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text, count, difficulty } = req.body;

    const questions = await aiService.generateFromText(
      text,
      count || 5,
      difficulty || "MIXED"
    );

    res.json({
      success: true,
      message: `Generated ${questions.length} questions from provided text.`,
      data: {
        questions,
        count: questions.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("API key")) {
      next(new AppError("AI service is not configured. Please set your OpenAI API key.", 503));
      return;
    }
    next(error);
  }
}

// ─── Generate from Wikipedia ──────────────────────────────────────────────────

export async function generateFromWikipedia(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url, count, difficulty } = req.body;

    const result = await aiService.generateFromWikipedia(
      url,
      count || 5,
      difficulty || "MIXED"
    );

    res.json({
      success: true,
      message: `Generated ${result.questions.length} questions from "${result.articleTitle}".`,
      data: {
        articleTitle: result.articleTitle,
        articleSummary: result.articleSummary,
        questions: result.questions,
        count: result.questions.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      next(new AppError(error.message, 404));
      return;
    }
    if (error instanceof Error && error.message.includes("API key")) {
      next(new AppError("AI service is not configured. Please set your OpenAI API key.", 503));
      return;
    }
    next(error);
  }
}

// ─── Get Hint ─────────────────────────────────────────────────────────────────

export async function getHint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { question, existingHints } = req.body;

    const hint = await aiService.generateHint(question, existingHints || []);

    res.json({
      success: true,
      data: { hint },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Explanation ──────────────────────────────────────────────────────────

export async function getExplanation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { question, correctAnswer, userAnswer } = req.body;

    const explanation = await aiService.generateExplanation(
      question,
      correctAnswer,
      userAnswer
    );

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    next(error);
  }
}

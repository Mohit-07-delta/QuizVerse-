import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import config from "../config/index.js";
import type { JWTPayload } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Validation Schemas ───────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  xp: number;
  level: number;
  streakDays: number;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    xp: user.xp,
    level: user.level,
    streakDays: user.streakDays,
    createdAt: user.createdAt,
    isGuest: user.email.endsWith('@quizverse.temp')
  };
}

const AVATAR_OPTIONS = [
  "avatar1", "avatar2", "avatar3", "avatar4", "avatar5",
  "avatar6", "avatar7", "avatar8", "avatar9", "avatar10",
];

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    // Update last login date and streak
    const now = new Date();
    const lastLogin = user.lastLoginDate;
    let streakDays = user.streakDays;

    if (lastLogin) {
      const diffMs = now.getTime() - lastLogin.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginDate: now, streakDays },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Logged in successfully.",
      data: {
        token,
        user: sanitizeUser({ ...user, streakDays }),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Google Login ─────────────────────────────────────────────────────────────

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token: googleToken } = req.body;

    // Verify token with Google
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${googleToken}` },
        timeout: 10000,
      }
    );

    const { sub: googleId, email, name, picture } = googleRes.data;

    if (!email) {
      throw new AppError("Could not retrieve email from Google account.", 400);
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (user) {
      // Link Google account if not linked and update
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
          avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
        },
      });
    }

    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Google login successful.",
      data: {
        token: jwtToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      next(new AppError("Invalid Google token.", 401));
      return;
    }
    next(error);
  }
}

// ─── Guest Login ──────────────────────────────────────────────────────────────

export async function guestLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name } = req.body;
    const guestId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const guestName = name ? name.trim() : `Guest_${guestId}`;
    const guestEmail = `guest_${guestId}@quizverse.temp`;
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

    const user = await prisma.user.create({
      data: {
        email: guestEmail,
        name: guestName,
        avatar: randomAvatar,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isGuest: true,
    });

    res.status(201).json({
      success: true,
      message: "Guest session created.",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Me ───────────────────────────────────────────────────────────────────

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        xp: true,
        level: true,
        streakDays: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            quizzes: true,
            hostedGames: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    res.json({
      success: true,
      data: {
        ...user,
        stats: user._count,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
}

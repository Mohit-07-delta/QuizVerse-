import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Validation Schemas ───────────────────────────────────────────────────────

export const sendFriendRequestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
});

export const friendRequestActionSchema = z.object({
  requestId: z.string().min(1, "Friend request ID is required"),
});

// ─── Send Friend Request ──────────────────────────────────────────────────────

export async function sendFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { receiverId } = req.body;

    if (receiverId === req.user.userId) {
      throw new AppError("You cannot send a friend request to yourself.", 400);
    }

    // Check receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new AppError("User not found.", 404);
    }

    // Check if request already exists (in either direction)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: req.user.userId, receiverId },
          { requesterId: receiverId, receiverId: req.user.userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        throw new AppError("You are already friends with this user.", 400);
      }
      if (existing.status === "PENDING") {
        throw new AppError("A friend request already exists.", 400);
      }
      if (existing.status === "REJECTED") {
        // Allow re-sending after rejection
        await prisma.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId: req.user.userId,
            receiverId,
            status: "PENDING",
          },
        });

        res.json({
          success: true,
          message: "Friend request sent.",
        });
        return;
      }
    }

    await prisma.friendship.create({
      data: {
        requesterId: req.user.userId,
        receiverId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Accept Friend Request ────────────────────────────────────────────────────

export async function acceptFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { requestId } = req.body;

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      throw new AppError("Friend request not found.", 404);
    }

    if (friendship.receiverId !== req.user.userId) {
      throw new AppError("You can only accept requests sent to you.", 403);
    }

    if (friendship.status !== "PENDING") {
      throw new AppError("This request has already been processed.", 400);
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    res.json({
      success: true,
      message: "Friend request accepted.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Reject Friend Request ───────────────────────────────────────────────────

export async function rejectFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { requestId } = req.body;

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      throw new AppError("Friend request not found.", 404);
    }

    if (friendship.receiverId !== req.user.userId) {
      throw new AppError("You can only reject requests sent to you.", 403);
    }

    if (friendship.status !== "PENDING") {
      throw new AppError("This request has already been processed.", 400);
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    res.json({
      success: true,
      message: "Friend request rejected.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Friends ──────────────────────────────────────────────────────────────

export async function getFriends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: req.user.userId, status: "ACCEPTED" },
          { receiverId: req.user.userId, status: "ACCEPTED" },
        ],
      },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true, xp: true, level: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true, xp: true, level: true },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friend =
        f.requesterId === req.user!.userId ? f.receiver : f.requester;
      return {
        friendshipId: f.id,
        ...friend,
        since: f.createdAt,
      };
    });

    // Get pending requests received
    const pendingReceived = await prisma.friendship.findMany({
      where: {
        receiverId: req.user.userId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Get pending requests sent
    const pendingSent = await prisma.friendship.findMany({
      where: {
        requesterId: req.user.userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        friends,
        pendingReceived: pendingReceived.map((p) => ({
          requestId: p.id,
          from: p.requester,
          createdAt: p.createdAt,
        })),
        pendingSent: pendingSent.map((p) => ({
          requestId: p.id,
          to: p.receiver,
          createdAt: p.createdAt,
        })),
        friendCount: friends.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Remove Friend ───────────────────────────────────────────────────────────

export async function removeFriend(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    const { friendshipId } = req.params;
    const fId = friendshipId as string;

    const friendship = await prisma.friendship.findUnique({
      where: { id: fId },
    });

    if (!friendship) {
      throw new AppError("Friendship not found.", 404);
    }

    if (
      friendship.requesterId !== req.user.userId &&
      friendship.receiverId !== req.user.userId
    ) {
      throw new AppError("You can only remove your own friends.", 403);
    }

    await prisma.friendship.delete({ where: { id: fId } });

    res.json({
      success: true,
      message: "Friend removed.",
    });
  } catch (error) {
    next(error);
  }
}

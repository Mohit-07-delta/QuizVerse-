import { Server, Socket } from "socket.io";
import prisma from "../lib/prisma.js";
import { GameState, SocketPlayer, IQuestion, IPlayerAnswer } from "../types/index.js";
import { calculatePoints, calculateXP, calculateLevel } from "../services/scoring.service.js";
import { checkAchievements } from "../services/achievement.service.js";
import { updateLeaderboard } from "../services/leaderboard.service.js";

// In-memory active games
const activeGames = new Map<string, GameState>();

export function initGameSocket(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Create Game ──────────────────────────────────────────────────────────
    socket.on("create-game", async ({ pin, userId }: { pin: string; userId: string }) => {
      try {
        const game = await prisma.game.findUnique({
          where: { pin },
          include: {
            quiz: true,
          },
        });

        if (!game) {
          socket.emit("error", { message: "Game not found in database." });
          return;
        }

        const gameState: GameState = {
          pin,
          quizId: game.quizId,
          hostSocketId: socket.id,
          hostUserId: userId,
          questions: game.quiz.questions as unknown as IQuestion[],
          currentQuestion: -1,
          players: new Map<string, SocketPlayer>(),
          status: "WAITING",
          timer: null,
          timeLeft: 0,
          answeredCount: 0,
          questionStartTime: 0,
          maxPlayers: game.maxPlayers,
          mode: game.mode,
          gameDbId: game.id,
        };

        activeGames.set(pin, gameState);
        socket.join(pin);

        socket.emit("game-created", {
          pin,
          mode: game.mode,
          quizTitle: game.quiz.title,
          questionCount: game.quiz.questions.length,
        });

        console.log(`Game created: PIN ${pin} hosted by socket ${socket.id}`);
      } catch (err: any) {
        socket.emit("error", { message: err.message || "Failed to host game." });
      }
    });

    // ─── Join Game ────────────────────────────────────────────────────────────
    socket.on("join-game", async ({ pin, nickname, avatar, userId }: {
      pin: string;
      nickname: string;
      avatar: string;
      userId?: string | null;
    }) => {
      try {
        const game = activeGames.get(pin);
        if (!game) {
          socket.emit("error", { message: "Active game lobby not found. Check the PIN." });
          return;
        }

        if (game.status !== "WAITING") {
          socket.emit("error", { message: "Game has already started or finished." });
          return;
        }

        if (game.players.size >= game.maxPlayers) {
          socket.emit("error", { message: "Lobby is full." });
          return;
        }

        // Check if nickname already exists
        for (const player of game.players.values()) {
          if (player.nickname.toLowerCase() === nickname.toLowerCase()) {
            socket.emit("error", { message: "Nickname is already taken in this lobby." });
            return;
          }
        }

        const newPlayer: SocketPlayer = {
          socketId: socket.id,
          userId: userId || null,
          nickname,
          avatar: avatar || "avatar1",
          score: 0,
          streak: 0,
          bestStreak: 0,
          combo: 1,
          xpEarned: 0,
          answers: [],
          isConnected: true,
          hasAnswered: false,
        };

        game.players.set(socket.id, newPlayer);
        socket.join(pin);

        socket.emit("joined-lobby", {
          pin,
          nickname,
          avatar: newPlayer.avatar,
          mode: game.mode,
          quizTitle: "Quiz Game", // Will update with full title from state if needed
        });

        // Broadcast updated player list to room
        const playersList = Array.from(game.players.values()).map(p => ({
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.score,
          isConnected: p.isConnected,
        }));

        io.to(pin).emit("players-update", playersList);
        console.log(`Player ${nickname} joined game ${pin}`);
      } catch (err: any) {
        socket.emit("error", { message: err.message || "Failed to join game." });
      }
    });

    // ─── Start Game ───────────────────────────────────────────────────────────
    socket.on("start-game", async ({ pin }: { pin: string }) => {
      const game = activeGames.get(pin);
      if (!game) {
        socket.emit("error", { message: "Game not found." });
        return;
      }

      if (game.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only the host can start the game." });
        return;
      }

      try {
        game.status = "IN_PROGRESS";
        await prisma.game.update({
          where: { id: game.gameDbId },
          data: { status: "IN_PROGRESS", startedAt: new Date() },
        });

        io.to(pin).emit("game-started");
        sendQuestion(io, game);
      } catch (err: any) {
        socket.emit("error", { message: "Error starting game in DB." });
      }
    });

    // ─── Submit Answer ────────────────────────────────────────────────────────
    socket.on("submit-answer", ({ pin, answerIndex }: { pin: string; answerIndex: number }) => {
      const game = activeGames.get(pin);
      if (!game || game.status !== "IN_PROGRESS") {
        socket.emit("error", { message: "Game is not in progress." });
        return;
      }

      const player = game.players.get(socket.id);
      if (!player) {
        socket.emit("error", { message: "You are not a player in this game." });
        return;
      }

      if (player.hasAnswered) {
        socket.emit("error", { message: "You have already answered this question." });
        return;
      }

      const question = game.questions[game.currentQuestion];
      const isCorrect = answerIndex === question.correctAnswer;
      const timeTaken = Math.max(0.1, (Date.now() - game.questionStartTime) / 1000);

      // Streaks and combos
      if (isCorrect) {
        player.streak += 1;
        if (player.streak > player.bestStreak) {
          player.bestStreak = player.streak;
        }
      } else {
        player.streak = 0;
      }

      // Combo formula: combo increases by 1 for every 3 consecutive correct answers, max 3x
      player.combo = 1 + Math.floor(player.streak / 3) * 0.5;
      if (player.combo > 3.0) player.combo = 3.0;

      // Points
      const scoreResult = calculatePoints(
        isCorrect,
        timeTaken,
        question.timer,
        player.streak,
        player.combo
      );

      player.score += scoreResult.points;
      player.hasAnswered = true;
      player.answers.push({
        questionIndex: game.currentQuestion,
        answer: answerIndex,
        isCorrect,
        timeTaken,
        pointsEarned: scoreResult.points,
      });

      game.answeredCount += 1;

      // Send result back to player
      socket.emit("answer-result", {
        isCorrect,
        points: scoreResult.points,
        totalScore: player.score,
        streak: player.streak,
        combo: player.combo,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });

      // Broadcast update that player answered (not showing their answer)
      io.to(pin).emit("player-answered", {
        nickname: player.nickname,
        answeredCount: game.answeredCount,
        totalPlayers: game.players.size,
      });

      // Auto-advance if everyone answered
      const allConnectedAnswered = Array.from(game.players.values())
        .filter(p => p.isConnected)
        .every(p => p.hasAnswered);

      if (allConnectedAnswered) {
        endQuestionPeriod(io, game);
      }
    });

    // ─── Next Question ────────────────────────────────────────────────────────
    socket.on("next-question", ({ pin }: { pin: string }) => {
      const game = activeGames.get(pin);
      if (!game || game.status !== "IN_PROGRESS") {
        socket.emit("error", { message: "Game is not in progress." });
        return;
      }

      if (game.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only the host can advance the question." });
        return;
      }

      if (game.currentQuestion + 1 >= game.questions.length) {
        finishGame(io, game);
      } else {
        sendQuestion(io, game);
      }
    });

    // ─── Request Hint ─────────────────────────────────────────────────────────
    socket.on("request-hint", ({ pin }: { pin: string }) => {
      const game = activeGames.get(pin);
      if (!game || game.status !== "IN_PROGRESS") {
        socket.emit("error", { message: "Game is not active." });
        return;
      }

      const question = game.questions[game.currentQuestion];
      if (question.hints && question.hints.length > 0) {
        // Return a random hint
        const randomHint = question.hints[Math.floor(Math.random() * question.hints.length)];
        socket.emit("hint-response", { hint: randomHint });
      } else {
        socket.emit("hint-response", { hint: "Focus on the basics! No hints available." });
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Handle host disconnect
      for (const [pin, game] of activeGames.entries()) {
        if (game.hostSocketId === socket.id) {
          console.log(`Host disconnected from game ${pin}. Finishing game.`);
          io.to(pin).emit("host-disconnected");
          finishGame(io, game);
          break;
        }

        // Handle player disconnect
        if (game.players.has(socket.id)) {
          const player = game.players.get(socket.id)!;
          player.isConnected = false;
          console.log(`Player ${player.nickname} disconnected from lobby ${pin}`);

          const playersList = Array.from(game.players.values()).map(p => ({
            nickname: p.nickname,
            avatar: p.avatar,
            score: p.score,
            isConnected: p.isConnected,
          }));

          io.to(pin).emit("players-update", playersList);

          // If in progress, check if this was the last player we were waiting for
          if (game.status === "IN_PROGRESS") {
            const allConnectedAnswered = Array.from(game.players.values())
              .filter(p => p.isConnected)
              .every(p => p.hasAnswered);

            if (allConnectedAnswered) {
              endQuestionPeriod(io, game);
            }
          }
          break;
        }
      }
    });
  });
}

// ─── Send Question helper ─────────────────────────────────────────────────────
function sendQuestion(io: Server, game: GameState): void {
  if (game.timer) clearInterval(game.timer);

  game.currentQuestion += 1;
  game.answeredCount = 0;
  
  // Reset hasAnswered for players
  for (const player of game.players.values()) {
    player.hasAnswered = false;
  }

  const question = game.questions[game.currentQuestion];
  game.timeLeft = question.timer;
  game.questionStartTime = Date.now();

  io.to(game.pin).emit("question", {
    questionIndex: game.currentQuestion,
    text: question.text,
    type: question.type,
    options: question.options,
    timer: question.timer,
    imageUrl: question.imageUrl || null,
    totalQuestions: game.questions.length,
  });

  // Start countdown timer
  game.timer = setInterval(() => {
    game.timeLeft -= 1;
    io.to(game.pin).emit("timer-tick", { timeLeft: game.timeLeft });

    if (game.timeLeft <= 0) {
      if (game.timer) clearInterval(game.timer);
      endQuestionPeriod(io, game);
    }
  }, 1000);
}

// ─── End Question Period helper ───────────────────────────────────────────────
function endQuestionPeriod(io: Server, game: GameState): void {
  if (game.timer) clearInterval(game.timer);

  const question = game.questions[game.currentQuestion];

  // Prepare leaderboard for this question
  const roundLeaderboard = Array.from(game.players.values())
    .map(p => ({
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      streak: p.streak,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  io.to(game.pin).emit("question-over", {
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    leaderboard: roundLeaderboard,
  });
}

// ─── Finish Game helper ───────────────────────────────────────────────────────
async function finishGame(io: Server, game: GameState): Promise<void> {
  if (game.timer) clearInterval(game.timer);
  game.status = "FINISHED";

  try {
    // 1. Calculate final ranking
    const finalPlayers = Array.from(game.players.values());
    finalPlayers.sort((a, b) => b.score - a.score);

    const podium = finalPlayers.slice(0, 3).map((p, idx) => ({
      rank: idx + 1,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
    }));

    // 2. Save analytics and rewards for authenticated players
    for (const player of finalPlayers) {
      if (player.userId) {
        // Questions stats
        const correctCount = player.answers.filter(a => a.isCorrect).length;
        const accuracy = game.questions.length > 0 ? Math.round((correctCount / game.questions.length) * 100) : 0;
        const totalPoints = player.score;

        const xpEarned = calculateXP(totalPoints, correctCount, game.questions.length);
        player.xpEarned = xpEarned;

        // Update DB player profile with XP & Level progression
        const user = await prisma.user.findUnique({ where: { id: player.userId } });
        if (user) {
          const newXp = user.xp + xpEarned;
          const newLevel = calculateLevel(newXp);
          const didLevelUp = newLevel > user.level;

          await prisma.user.update({
            where: { id: player.userId },
            data: {
              xp: newXp,
              level: newLevel,
              streakDays: { increment: 1 }, // simple increment
            },
          });

          // Save analytics
          await prisma.analytics.create({
            data: {
              userId: player.userId,
              quizId: game.quizId,
              quizTitle: "Game Session Quiz", // or query DB
              score: totalPoints,
              totalQuestions: game.questions.length,
              correctAnswers: correctCount,
              accuracy,
              timeTaken: player.answers.reduce((sum, ans) => sum + ans.timeTaken, 0),
              category: "General",
            },
          });

          // Check Achievements
          await checkAchievements(player.userId, {
            totalGamesPlayed: 1, // Will aggregate in service
            accuracy,
            fastestAnswer: Math.min(...player.answers.map(a => a.timeTaken), 999),
            currentStreak: player.bestStreak,
            perfectScore: correctCount === game.questions.length,
          });
        }

        // Update global leaderboard
        await updateLeaderboard(player.userId, totalPoints, "ALL_TIME");
        await updateLeaderboard(player.userId, totalPoints, "WEEKLY");
        await updateLeaderboard(player.userId, totalPoints, "MONTHLY");
      }
    }

    // 3. Update DB Game status
    const dbPlayersData = finalPlayers.map(p => ({
      userId: p.userId,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      streak: p.streak,
      bestStreak: p.bestStreak,
      combo: p.combo,
      xpEarned: p.xpEarned,
      isConnected: p.isConnected,
      answers: p.answers,
    }));

    await prisma.game.update({
      where: { id: game.gameDbId },
      data: {
        status: "FINISHED",
        endedAt: new Date(),
        players: dbPlayersData,
      },
    });

    // 4. Update Quiz play count
    await prisma.quiz.update({
      where: { id: game.quizId },
      data: { plays: { increment: 1 } },
    });

    // 5. Emit game-ended event
    io.to(game.pin).emit("game-ended", {
      podium,
      leaderboard: finalPlayers.map(p => ({
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        xpEarned: p.xpEarned,
      })),
    });

    // Remove from in-memory active games
    activeGames.delete(game.pin);
  } catch (err) {
    console.error("Error finishing game session:", err);
    io.to(game.pin).emit("error", { message: "Error completing the game session in database." });
  }
}

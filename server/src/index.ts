import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import config from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import generalLimiter from "./middleware/rateLimiter.js";
import prisma from "./lib/prisma.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import gameRoutes from "./routes/game.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import socialRoutes from "./routes/social.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Import Socket Handler
import { initGameSocket } from "./socket/gameSocket.js";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to general API
app.use("/api", generalLimiter);

// Mount API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/games", gameRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/leaderboards", leaderboardRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/admin", adminRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Initialize Socket Game Engine
initGameSocket(io);

// Start Server
const PORT = config.PORT;

async function startServer() {
  try {
    // Test prisma database connection
    await prisma.$connect();
    console.log("Successfully connected to the MongoDB database via Prisma.");

    httpServer.listen(PORT, () => {
      console.log(`QuizVerse AI Server is running in ${config.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failure:", error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

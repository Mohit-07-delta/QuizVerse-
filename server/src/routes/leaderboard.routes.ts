import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

// Leaderboards are public but optional auth highlights user placement
router.get("/", optionalAuth, getLeaderboard);

export default router;

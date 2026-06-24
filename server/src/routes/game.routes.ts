import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createGame,
  getGame,
  joinGame,
  createGameSchema,
  joinGameSchema,
} from "../controllers/game.controller.js";

const router = Router();

// Public routes
router.get("/:pin", getGame);

// Protected routes (REST API endpoints for setup)
router.post("/", authenticate, validate(createGameSchema), createGame);
router.post("/join", validate(joinGameSchema), joinGame);

export default router;

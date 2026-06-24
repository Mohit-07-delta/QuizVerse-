import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getMyQuizzes,
  getPublicQuizzes,
  createQuizSchema,
  updateQuizSchema,
} from "../controllers/quiz.controller.js";

const router = Router();

// Public routes
router.get("/public", getPublicQuizzes);
router.get("/", optionalAuth, getQuizzes);
router.get("/:id", optionalAuth, getQuiz);

// Protected routes
router.post("/", authenticate, validate(createQuizSchema), createQuiz);
router.get("/user/my-quizzes", authenticate, getMyQuizzes);
router.put("/:id", authenticate, validate(updateQuizSchema), updateQuiz);
router.delete("/:id", authenticate, deleteQuiz);

export default router;

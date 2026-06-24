import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  getUsers,
  getDashboardStats,
  deleteUser,
  adminDeleteQuiz,
  getReports,
} from "../controllers/admin.controller.js";

const router = Router();

// Gated behind authentication and admin privileges
router.use(authenticate, requireAdmin);

router.get("/users", getUsers);
router.get("/stats", getDashboardStats);
router.get("/reports", getReports);
router.delete("/users/:id", deleteUser);
router.delete("/quizzes/:id", adminDeleteQuiz);

export default router;

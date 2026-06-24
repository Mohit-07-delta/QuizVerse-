import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  getAnalytics,
  getAchievements,
} from "../controllers/user.controller.js";

const router = Router();

// Profile detail can be public
router.get("/profile/:id?", authenticate, getProfile);

// Other user endpoints are protected
router.put("/profile", authenticate, updateProfile);
router.get("/analytics", authenticate, getAnalytics);
router.get("/achievements", authenticate, getAchievements);

export default router;

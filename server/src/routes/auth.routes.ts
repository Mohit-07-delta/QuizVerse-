import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  register,
  login,
  googleLogin,
  guestLogin,
  getMe,
  refreshToken,
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../controllers/auth.controller.js";

const router = Router();

// Public routes (with auth rate limiter)
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", authLimiter, validate(googleLoginSchema), googleLogin);
router.post("/guest", authLimiter, guestLogin);

// Protected routes
router.get("/me", authenticate, getMe);
router.post("/refresh", authenticate, refreshToken);

export default router;

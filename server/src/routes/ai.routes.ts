import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import {
  generateFromTopic,
  generateFromText,
  generateFromWikipedia,
  getHint,
  getExplanation,
  generateFromTopicSchema,
  generateFromTextSchema,
  generateFromWikipediaSchema,
  getHintSchema,
  getExplanationSchema,
} from "../controllers/ai.controller.js";

const router = Router();

// Apply authentication to all AI routes
router.use(authenticate);

router.post("/generate-from-topic", aiLimiter, validate(generateFromTopicSchema), generateFromTopic);
router.post("/generate-from-text", aiLimiter, validate(generateFromTextSchema), generateFromText);
router.post("/generate-from-wikipedia", aiLimiter, validate(generateFromWikipediaSchema), generateFromWikipedia);
router.post("/hint", validate(getHintSchema), getHint);
router.post("/explain", validate(getExplanationSchema), getExplanation);

export default router;

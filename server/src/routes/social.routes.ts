import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  sendFriendRequestSchema,
  friendRequestActionSchema,
} from "../controllers/social.controller.js";

const router = Router();

// Apply auth
router.use(authenticate);

router.get("/friends", getFriends);
router.post("/request", validate(sendFriendRequestSchema), sendFriendRequest);
router.post("/accept", validate(friendRequestActionSchema), acceptFriendRequest);
router.post("/reject", validate(friendRequestActionSchema), rejectFriendRequest);
router.delete("/friends/:friendshipId", removeFriend);

export default router;

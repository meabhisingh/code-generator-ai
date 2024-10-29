import express from "express";
import { chatController } from "../controllers/chat.js";
import { rateLimiter } from "../lib/features.js";

const router = express.Router();

router.use(rateLimiter({ limit: 3, timer: 60, page: "chat" })); // Rate limit: 5 requests per minute

// Chating with AI
router.post("/chat/:sessionId", chatController);

export default router;

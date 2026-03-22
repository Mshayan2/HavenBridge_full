import express from "express";
import {
  createOrGetConversation,
  listMessages,
  listMyConversations,
  markConversationRead,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", listMyConversations);
router.post("/conversations", createOrGetConversation);
router.get("/conversations/:id/messages", listMessages);
router.post("/conversations/:id/messages", sendMessage);
router.post("/conversations/:id/read", markConversationRead);

export default router;

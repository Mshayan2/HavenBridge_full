import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.post("/my/read-all", protect, markAllNotificationsRead);
router.post("/my/:id/read", protect, markNotificationRead);

export default router;

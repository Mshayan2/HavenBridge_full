// backend/routes/userRoutes.js
import express from "express";
import { getUsers, updateUserRole } from "../controllers/userController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/users (admin-only)
router.get("/", protect, adminOnly, getUsers);

// PUT /api/users/:id/role (admin-only)
router.put("/:id/role", protect, adminOnly, updateUserRole);

export default router;

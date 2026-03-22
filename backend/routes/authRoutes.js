import express from "express";
import {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";

import { authRateLimiter } from "../middlewares/securityMiddleware.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);

router.get("/verify-email", authRateLimiter, verifyEmail);
router.post("/resend-verification", authRateLimiter, resendVerification);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);

// Protected profile route
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;

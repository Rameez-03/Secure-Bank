import express from "express";
import {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes — stricter rate limit on auth endpoints
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/change-password", protect, authLimiter, changePassword);

export default router;


import express from "express";
import { 
  register, 
  login, 
  refreshToken, 
  getMe, 
  logout 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
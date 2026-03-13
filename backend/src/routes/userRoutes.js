import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Get user by ID (protected)
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("transactions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Only allow users to get their own data
    if (user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this user's data"
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Update user budget
router.put("/:id/budget", protect, async (req, res) => {
  try {
    const { budget } = req.body;

    // Only allow users to update their own budget
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user's budget"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { budget },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: { user }
    });

  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Update user profile
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Only allow users to update their own profile
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user's profile"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user }
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
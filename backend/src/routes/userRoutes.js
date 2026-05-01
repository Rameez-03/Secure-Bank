import express from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";
import { getHealthScore } from "../controllers/healthScoreController.js";
import { safeDecrypt } from "../utils/encrypt.js";
import logger from "../utils/logger.js";
import { sendAlert } from "../utils/alert.js";

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BUDGET_MAX = 10_000_000;

const COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/auth",
};

// Financial Health Score
router.get("/health-score", protect, getHealthScore);

// Get user by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to access this user's data" });
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    logger.error("getUser.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user budget
router.put("/:id/budget", protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user's budget" });
    }

    const { budget } = req.body;
    const parsed = Number(budget);

    if (budget === undefined || budget === null || budget === "") {
      return res.status(400).json({ success: false, message: "Budget is required" });
    }
    if (!Number.isFinite(parsed)) {
      return res.status(400).json({ success: false, message: "Budget must be a number" });
    }
    if (parsed < 0) {
      return res.status(400).json({ success: false, message: "Budget cannot be negative" });
    }
    if (parsed > BUDGET_MAX) {
      return res.status(400).json({ success: false, message: `Budget cannot exceed ${BUDGET_MAX}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { budget: parsed },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Budget updated successfully", data: { user } });
  } catch (error) {
    logger.error("updateBudget.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user profile
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user's profile" });
    }

    const { name, email } = req.body;

    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length === 0 || trimmed.length > 100) {
        return res.status(400).json({ success: false, message: "Name must be between 1 and 100 characters" });
      }
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address" });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select("-password");
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(400).json({ success: false, message: "An account with this email already exists" });
      }
      throw dbErr;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", data: { user } });
  } catch (error) {
    logger.error("updateProfile.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Export personal data — Article 15 (access) + Article 20 (portability)
router.get("/:id/export", protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to export this account's data" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const Transaction = (await import("../models/transactionModel.js")).default;
    const transactions = await Transaction.find({ userId: req.params.id }).sort({ date: -1 });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      exportFormat: "SecureBank Data Export v1",
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        budget: user.budget,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      transactions: transactions.map((tx) => ({
        id: tx._id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        pending: tx.pending,
        isManual: tx.isManual,
        createdAt: tx.createdAt,
      })),
    };

    sendAlert("data.export", req.user.userId, req.ip);
    res.setHeader("Content-Disposition", `attachment; filename="securebank-export-${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(exportPayload);
  } catch (error) {
    logger.error("exportData.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Toggle processing restriction — Article 18 (right to restriction of processing)
router.post("/:id/restrict", protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isRestricted: !user.isRestricted },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: updated.isRestricted ? "Processing restricted" : "Restriction lifted",
      data: { isRestricted: updated.isRestricted },
    });
  } catch (error) {
    logger.error("toggleRestriction.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete account — permanently removes user, all transactions, and revokes Plaid access
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this account" });
    }

    const user = await User.findById(req.params.id).select("+accessToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Best-effort Plaid token revocation — don't fail if Plaid is unreachable
    if (user.accessToken) {
      try {
        const plaidClient = new PlaidApi(new Configuration({
          basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
          baseOptions: {
            headers: {
              "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
              "PLAID-SECRET": process.env.PLAID_SECRET,
            },
          },
        }));
        await plaidClient.itemRemove({ access_token: safeDecrypt(user.accessToken) });
      } catch (e) {
        logger.warn("deleteAccount.plaid_revocation_failed", { error: e.message });
      }
    }

    const Transaction = (await import("../models/transactionModel.js")).default;
    await Transaction.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    sendAlert("account.deleted", req.user.userId, req.ip);
    res.clearCookie("rt", COOKIE_CLEAR_OPTIONS);

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    logger.error("deleteAccount.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

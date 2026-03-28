import express from "express";
import {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

// @route   /api/transactions
router.route("/")
  .post(addTransaction)      // Create new manual transaction
  .get(getTransactions);     // Get all user's transactions (Plaid + manual)

// @route   /api/transactions/:id
router.route("/:id")
  .get(getTransaction)       // Get single transaction
  .patch(updateTransaction)  // Update transaction
  .delete(deleteTransaction); // Delete transaction

export default router;
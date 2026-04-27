import mongoose from "mongoose";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";

const AMOUNT_MIN = -1_000_000_000;
const AMOUNT_MAX =  1_000_000_000;
const DESC_MAX   = 500;
const CAT_MAX    = 100;
const DATE_MIN   = new Date("1970-01-01").getTime();
const DATE_MAX   = new Date("2100-12-31").getTime();

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  if (d.getTime() < DATE_MIN || d.getTime() > DATE_MAX) return null;
  return d;
};

const validateAmount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "Amount must be a finite number";
  if (n < AMOUNT_MIN || n > AMOUNT_MAX) return `Amount must be between ${AMOUNT_MIN} and ${AMOUNT_MAX}`;
  return null;
};

const RESTRICTION_MSG = "Processing is currently restricted on your account. Lift the restriction in Settings to make changes.";

const checkRestricted = async (userId) => {
  const user = await User.findById(userId).select("isRestricted");
  return user?.isRestricted === true;
};

// Create a manual transaction
export const addTransaction = async (req, res) => {
  try {
    if (await checkRestricted(req.user.userId)) {
      return res.status(403).json({ success: false, message: RESTRICTION_MSG });
    }

    const { date, description, amount, category } = req.body;

    if (!description || amount === undefined || amount === null || !category) {
      return res.status(400).json({ success: false, message: "Description, amount, and category are required" });
    }

    const amountErr = validateAmount(amount);
    if (amountErr) return res.status(400).json({ success: false, message: amountErr });

    if (typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Description must be a non-empty string" });
    }
    if (description.trim().length > DESC_MAX) {
      return res.status(400).json({ success: false, message: `Description cannot exceed ${DESC_MAX} characters` });
    }

    if (typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Category must be a non-empty string" });
    }
    if (category.trim().length > CAT_MAX) {
      return res.status(400).json({ success: false, message: `Category cannot exceed ${CAT_MAX} characters` });
    }

    let parsedDate = new Date();
    if (date !== undefined) {
      parsedDate = parseDate(date);
      if (!parsedDate) {
        return res.status(400).json({ success: false, message: "Invalid date — must be between 1970 and 2100" });
      }
    }

    const newTransaction = await Transaction.create({
      userId: req.user.userId,
      date: parsedDate,
      description: description.trim(),
      amount: Number(amount),
      category: category.trim(),
      isManual: true,
    });

    await User.findByIdAndUpdate(req.user.userId, { $push: { transactions: newTransaction._id } });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction: newTransaction },
    });
  } catch (error) {
    logger.error("addTransaction.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error creating transaction" });
  }
};

// Get all transactions for logged-in user — paginated (default 500, max 500)
export const getTransactions = async (req, res) => {
  try {
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 500));
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const skip  = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.user.userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ userId: req.user.userId }),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: { transactions },
    });
  } catch (error) {
    logger.error("getTransactions.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error fetching transactions" });
  }
};

// Get single transaction by ID
export const getTransaction = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to access this transaction" });
    }

    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    logger.error("getTransaction.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error fetching transaction" });
  }
};

// Update a manual transaction — Plaid-synced transactions are read-only
export const updateTransaction = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (await checkRestricted(req.user.userId)) {
      return res.status(403).json({ success: false, message: RESTRICTION_MSG });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this transaction" });
    }

    if (!transaction.isManual) {
      return res.status(403).json({ success: false, message: "Bank-imported transactions cannot be edited" });
    }

    const { date, description, amount, category } = req.body;
    const updateFields = {};

    if (amount !== undefined) {
      const amountErr = validateAmount(amount);
      if (amountErr) return res.status(400).json({ success: false, message: amountErr });
      updateFields.amount = Number(amount);
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Description must be a non-empty string" });
      }
      if (description.trim().length > DESC_MAX) {
        return res.status(400).json({ success: false, message: `Description cannot exceed ${DESC_MAX} characters` });
      }
      updateFields.description = description.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || category.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Category must be a non-empty string" });
      }
      if (category.trim().length > CAT_MAX) {
        return res.status(400).json({ success: false, message: `Category cannot exceed ${CAT_MAX} characters` });
      }
      updateFields.category = category.trim();
    }

    if (date !== undefined) {
      const parsedDate = parseDate(date);
      if (!parsedDate) {
        return res.status(400).json({ success: false, message: "Invalid date — must be between 1970 and 2100" });
      }
      updateFields.date = parsedDate;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: { transaction: updated },
    });
  } catch (error) {
    logger.error("updateTransaction.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error updating transaction" });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (await checkRestricted(req.user.userId)) {
      return res.status(403).json({ success: false, message: RESTRICTION_MSG });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this transaction" });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.userId, { $pull: { transactions: req.params.id } });

    res.status(200).json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    logger.error("deleteTransaction.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error deleting transaction" });
  }
};

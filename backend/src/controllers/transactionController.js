import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";

// Create a transaction
export const addTransaction = async (req, res) => {
  try {
    const { date, description, amount, category } = req.body;

    // Validation
    if (!description || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide description, amount, and category"
      });
    }

    // Create manual transaction with authenticated user's ID
    const newTransaction = await Transaction.create({
      userId: req.user.userId,
      date: date || new Date(),
      description,
      amount,
      category,
      isManual: true  // Mark as manually created
    });

    // Add transaction to user's transactions array
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { transactions: newTransaction._id } }
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction: newTransaction }
    });

  } catch (error) {
    console.error("Error in addTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating transaction"
    });
  }
};

// Get all transactions for logged-in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: { transactions }
    });

  } catch (error) {
    console.error("Error in getTransactions:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching transactions"
    });
  }
};

// Get single transaction by ID
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Check if transaction belongs to logged-in user
    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this transaction"
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });

  } catch (error) {
    console.error("Error in getTransaction:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching transaction"
    });
  }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { date, description, amount, category } = req.body;

    // Find transaction first
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this transaction"
      });
    }

    // Build update object
    const updateFields = {};
    if (date) updateFields.date = date;
    if (description) updateFields.description = description;
    if (amount) updateFields.amount = amount;
    if (category) updateFields.category = category;

    // Update transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: { transaction }
    });

  } catch (error) {
    console.error("Error in updateTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating transaction"
    });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this transaction"
      });
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(req.params.id);

    // Remove from user's transactions array
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { transactions: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error deleting transaction"
    });
  }
};
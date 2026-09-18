const Transaction = require("../models/Transaction");
const { recalculateUserStats } = require("../services/userStatsService");

/**
 * List all transactions for the authenticated user
 */
async function getTransactions(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      transactions,
      // Backward-compatibility alias
      allExpense: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching transactions: " + error.message,
    });
  }
}

/**
 * Get a single transaction by ID (scoped to authenticated user)
 */
async function getTransactionById(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching transaction: " + error.message,
    });
  }
}

/**
 * Create a new transaction and update user statistics
 */
async function createTransaction(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const { amount, category, type } = req.body;
  const title = req.body.title || req.body.expense;
  const notes = req.body.notes || req.body.note;

  if (!title || amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      message: "Title and amount are required",
    });
  }

  try {
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      category: category || "Other",
      notes: notes || "",
      type: type || "expense",
    });

    // Centralized stats recalculation via userStatsService
    const updatedStats = await recalculateUserStats(req.user._id);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
      stats: updatedStats,
      // Backward-compatibility alias
      blog: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating transaction: " + error.message,
    });
  }
}

/**
 * Update an existing transaction and recalculate statistics
 */
async function updateTransaction(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const { amount, category, type } = req.body;
  const title = req.body.title || req.body.expense;
  const notes = req.body.notes || req.body.note;

  try {
    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (amount !== undefined) updatedFields.amount = Number(amount);
    if (category !== undefined) updatedFields.category = category;
    if (notes !== undefined) updatedFields.notes = notes;
    if (type !== undefined) updatedFields.type = type;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updatedFields,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    }

    // Centralized stats recalculation via userStatsService
    const updatedStats = await recalculateUserStats(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
      stats: updatedStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating transaction: " + error.message,
    });
  }
}

/**
 * Delete a transaction and recalculate statistics
 */
async function deleteTransaction(req, res) {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    }

    // Centralized stats recalculation via userStatsService
    const updatedStats = await recalculateUserStats(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      stats: updatedStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting transaction: " + error.message,
    });
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

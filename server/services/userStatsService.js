const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const UserStats = require("../models/UserStats");

/**
 * Centralized service to recalculate and persist user spending and income statistics.
 * Eliminates repeated MongoDB aggregation pipelines across routes.
 * 
 * @param {string|mongoose.Types.ObjectId} userId - The ID of the user
 * @returns {Promise<Object>} The updated UserStats document
 */
async function recalculateUserStats(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Calculate Category Totals (Only for Expenses)
  const expenseAggregation = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: "expense",
      },
    },
    {
      $group: {
        _id: "$category",
        totalSpent: { $sum: "$amount" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

  // 2. Calculate Total Expense via MongoDB aggregate pipeline
  const totalExpenseAggregation = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: "expense",
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" },
      },
    },
  ]);
  const totalExpense = totalExpenseAggregation[0]?.totalExpense || 0;

  // 3. Calculate Income Category Totals
  const incomeAggregation = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: "income",
      },
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // 4. Calculate Total Income via MongoDB aggregate pipeline
  const totalIncomeAggregation = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: "income",
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$amount" },
      },
    },
  ]);
  const totalIncome = totalIncomeAggregation[0]?.totalIncome || 0;
  const mostSpentCategory = expenseAggregation[0]?._id ?? null;

  // 5. Upsert UserStats document
  const updatedStats = await UserStats.findOneAndUpdate(
    { user: userObjectId },
    {
      mostSpentCategory,
      expenseCategoryTotals: expenseAggregation,
      incomeCategoryTotals: incomeAggregation,
      totalExpense,
      totalIncome,
    },
    { upsert: true, new: true }
  );

  return updatedStats;
}

module.exports = {
  recalculateUserStats,
};

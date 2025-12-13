const { Router } = require("express");
const dashboardRoute = Router();
const expenseDb = require("../models/expense");
const userDb = require("../models/user");
const mongoose = require("mongoose");

const userStats = require("../models/userStats");

dashboardRoute.route("/").get(async (req, res) => {
  //console.log(req.user)
  const user = await userDb.findById(req.user._id);
  const stats = await userStats.findOne({ user: req.user._id });
  
  console.log("current user:", user);
  if (user)
    return res.json({
      success: true,
      message: "Dashboard data loaded",
      user,
      stats: stats || {} // Return empty object if no stats yet
    });
  else {
    return res.json({
      success: false,
      message: "user does not exist",
      user: "NA",
      stats: {}
    });
  }
});

dashboardRoute
  .route("/expense")
  .get((req, res) => {
    return res.json({
      success: true,
    });
  })
  .post(async (req, res) => {
    const { expense, amount, category, note, type } = req.body;
    
    const blog = await expenseDb.create({
      user: req.user._id,
      title: expense,
      amount,
      category,
      notes: note,
      type: type || 'expense' 
    });

    // Calculate Category Totals (Only for Expenses)
    const expenseAggregation = await expenseDb.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'expense' 
        } 
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    // Calculate Total Income
    const incomeAggregation = await expenseDb.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'income' 
        } 
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate total income sum for backward compatibility
    const totalIncome = incomeAggregation.reduce((sum, item) => sum + item.totalAmount, 0);
    const mostSpentCategory = expenseAggregation[0]?._id ?? null;

    // Update UserStats instead of User
    await userStats.findOneAndUpdate(
      { user: req.user._id },
      {
        mostSpentCategory: mostSpentCategory,
        categoryTotals: expenseAggregation,
        incomeCategoryTotals: incomeAggregation,
        totalIncome: totalIncome
      },
      { upsert: true, new: true }
    );

    const updatedUser = await userDb.findById(req.user._id);
    const updatedStats = await userStats.findOne({ user: req.user._id });
    
    return res.json({
      success: true,
      message: "Data Posted",
      blog,
      user: updatedUser,
      stats: updatedStats
    });
  });
dashboardRoute.route("/expense/:id")
  .get(async (req, res) => {
    const allExpense = await expenseDb.find({ user: req.params.id });
    return res.json({
      success: true,
      allExpense,
    });
  })
  .delete(async (req, res) => {
    try {
      await expenseDb.findByIdAndDelete(req.params.id);
      
      // Recalculate Stats
      const expenseAggregation = await expenseDb.aggregate([
        { 
          $match: { 
            user: new mongoose.Types.ObjectId(req.user._id),
            type: 'expense' 
          } 
        },
        {
          $group: {
            _id: "$category",
            totalSpent: { $sum: "$amount" },
          },
        },
        { $sort: { totalSpent: -1 } },
      ]);

      const incomeAggregation = await expenseDb.aggregate([
        { 
          $match: { 
            user: new mongoose.Types.ObjectId(req.user._id),
            type: 'income' 
          } 
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalIncome = incomeAggregation.reduce((sum, item) => sum + item.totalAmount, 0);
      const mostSpentCategory = expenseAggregation[0]?._id ?? null;

      await userStats.findOneAndUpdate(
        { user: req.user._id },
        {
          mostSpentCategory: mostSpentCategory,
          categoryTotals: expenseAggregation,
          incomeCategoryTotals: incomeAggregation,
          totalIncome: totalIncome
        },
        { upsert: true }
      );

      return res.json({ success: true, message: "Transaction deleted" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error deleting transaction" });
    }
  })
  .put(async (req, res) => {
    try {
      const { expense, amount, category, note, type } = req.body;
      await expenseDb.findByIdAndUpdate(req.params.id, {
        title: expense,
        amount,
        category,
        notes: note,
        type: type || 'expense'
      });

      // Recalculate Stats
      const expenseAggregation = await expenseDb.aggregate([
        { 
          $match: { 
            user: new mongoose.Types.ObjectId(req.user._id),
            type: 'expense' 
          } 
        },
        {
          $group: {
            _id: "$category",
            totalSpent: { $sum: "$amount" },
          },
        },
        { $sort: { totalSpent: -1 } },
      ]);

      const incomeAggregation = await expenseDb.aggregate([
        { 
          $match: { 
            user: new mongoose.Types.ObjectId(req.user._id),
            type: 'income' 
          } 
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalIncome = incomeAggregation.reduce((sum, item) => sum + item.totalAmount, 0);
      const mostSpentCategory = expenseAggregation[0]?._id ?? null;

      await userStats.findOneAndUpdate(
        { user: req.user._id },
        {
          mostSpentCategory: mostSpentCategory,
          categoryTotals: expenseAggregation,
          incomeCategoryTotals: incomeAggregation,
          totalIncome: totalIncome
        },
        { upsert: true }
      );

      return res.json({ success: true, message: "Transaction updated" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error updating transaction" });
    }
  });
module.exports = dashboardRoute;

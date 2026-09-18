const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userStatsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    mostSpentCategory: {
      type: String,
      default: null,
    },
    expenseCategoryTotals: {
      type: Array,
      default: [],
    },
    incomeCategoryTotals: {
      type: Array,
      default: [],
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    aiMessageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Explicit collection name "userstats" ensures backwards compatibility
const UserStats = mongoose.models.UserStats || model("UserStats", userStatsSchema, "userstats");
module.exports = UserStats;

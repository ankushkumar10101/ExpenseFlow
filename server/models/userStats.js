const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userStatsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    mostSpentCategory: {
      type: String,
      default: null,
    },
    categoryTotals: {
      type: Array,
      default: [],
    },
    incomeCategoryTotals: {
      type: Array,
      default: [],
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

const userStats = model("UserStats", userStatsSchema);
module.exports = userStats;

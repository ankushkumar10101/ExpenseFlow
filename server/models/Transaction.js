const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Health",
        "Entertainment",
        "Investment",
        "Salary",
        "Freelance",
        "Investments",
        "Gift",
        "Other",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pinning collection name "expenses" ensures backwards compatibility with existing database records
const Transaction = model("Transaction", transactionSchema, "expenses");
module.exports = Transaction;

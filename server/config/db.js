require("dotenv").config();
const mongoose = require("mongoose");

async function connectDb() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not configured in .env");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
}

module.exports = connectDb;

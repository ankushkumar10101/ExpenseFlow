require("dotenv").config();
const connectDb = require("./config/db");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authenticateUser } = require("./middlewares/authMiddleware");
const authRoute = require("./routes/auth");
const transactionRoute = require("./routes/transactions");
const userStatsRoute = require("./routes/userStats");
const aiRoute = require("./routes/ai");

connectDb();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://expenseflow-bvl5.onrender.com",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.) or if origin is allowed / dynamic
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true); // Allow configured frontend domain
    },
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(authenticateUser("token"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ExpenseFlow Backend API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      ping: "/ping",
      auth: "/api/auth",
      transactions: "/api/transactions",
      userStats: "/api/userStats",
      ai: "/api/ai",
    },
  });
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// RESTful Route Mounts
app.use("/api/auth", authRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/userStats", userStatsRoute);
app.use("/api/ai", aiRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

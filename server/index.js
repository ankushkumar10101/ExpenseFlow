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

app.use(
  cors({
    origin: ["http://localhost:5173", "https://expenseflow-bvl5.onrender.com"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(authenticateUser("token"));

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// RESTful Route Mounts
app.use("/api/auth", authRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/userStats", userStatsRoute);
app.use("/api/ai", aiRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

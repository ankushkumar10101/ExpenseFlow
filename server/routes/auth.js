const { Router } = require("express");
const authRoute = Router();
const authController = require("../controllers/authController");

// Registration endpoint
authRoute.post("/register", authController.register);

// Login endpoint
authRoute.post("/login", authController.login);

// Current user verification endpoint
authRoute.get("/verify", authController.getCurrentUser);

// Logout endpoint
authRoute.post("/logout", authController.logout);

module.exports = authRoute;

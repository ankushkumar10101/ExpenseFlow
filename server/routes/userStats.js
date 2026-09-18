const { Router } = require("express");
const userStatsRoute = Router();
const userStatsController = require("../controllers/userStatsController");

userStatsRoute.get("/", userStatsController.getUserStats);

module.exports = userStatsRoute;

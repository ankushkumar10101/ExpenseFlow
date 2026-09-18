const { Router } = require("express");
const aiRoute = Router();
const aiController = require("../controllers/aiController");

aiRoute.post("/chat", aiController.chatWithAi);

module.exports = aiRoute;

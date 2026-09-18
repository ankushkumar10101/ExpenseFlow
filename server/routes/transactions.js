const { Router } = require("express");
const transactionsRoute = Router();
const transactionController = require("../controllers/transactionController");

// List user transactions / Create transaction
transactionsRoute
  .route("/")
  .get(transactionController.getTransactions)
  .post(transactionController.createTransaction);

// Single transaction CRUD
transactionsRoute
  .route("/:id")
  .get(transactionController.getTransactionById)
  .put(transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);

module.exports = transactionsRoute;

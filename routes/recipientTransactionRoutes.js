const express = require("express");
const router = express.Router();
const recipientTransactionController = require("../controllers/recipientTransactionController");

// Book food (plates not reduced)
router.post("/book", recipientTransactionController.bookFood);

// Take food (plates reduced)
router.post("/take", recipientTransactionController.takeFood);

// Get all recipient transactions
router.get("/", recipientTransactionController.getAllRecipientTransactions);

module.exports = router;

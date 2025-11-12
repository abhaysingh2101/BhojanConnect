const express = require("express");
const router = express.Router();
const recipientTransactionController = require("../controllers/recipientTransactionController");

// Book food 
router.post("/book", recipientTransactionController.bookFood);

//  Take food 
router.post("/take", recipientTransactionController.takeFood);

//  Get all recipient transactions
router.get("/", recipientTransactionController.getAllRecipientTransactions);

// List recipients who booked food for a specific NGO
router.get("/list/:ngoId", recipientTransactionController.listRecipientsBooked);

module.exports = router;

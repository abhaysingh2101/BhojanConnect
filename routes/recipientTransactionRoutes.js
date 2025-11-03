const express = require("express");
const router = express.Router();
const { bookFood, takeFood, listRecipientsBooked } = require("../controllers/recipientTransactionController");
const auth = require("../middlewares/auth"); 

router.post("/book", bookFood);


router.post("/take",  takeFood);

router.get("/list/:ngoId", listRecipientsBooked);

module.exports = router;

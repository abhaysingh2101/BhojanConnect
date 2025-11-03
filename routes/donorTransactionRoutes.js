// routes/donorTransactionRoutes.js
const express = require("express");
const router = express.Router();
const { donateFood } = require("../controllers/donorTransactionController");
const auth = require("../middlewares/auth");

// POST /donor/donate
router.post("/donate", donateFood);

module.exports = router;

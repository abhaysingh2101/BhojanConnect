// routes/recipientRoutes.js
const express = require("express");
const router = express.Router();
const recipientController = require("../controllers/recipientController");
const auth = require("../middlewares/auth");

router.post("/register", recipientController.registerRecipient);
router.post("/login", recipientController.loginRecipient);

router.get("/profile", auth, recipientController.getRecipientProfile);

module.exports = router;

// routes/donorRoutes.js
const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const auth = require("../middlewares/auth");

// Public
router.post("/register", donorController.registerDonor);
router.post("/login", donorController.loginDonor);

// Protected example: get own profile
router.get("/profile", auth, donorController.getDonorProfile);

module.exports = router;

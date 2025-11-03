const express = require("express");
const router = express.Router();
const ngoController = require("../controllers/ngoController");

// Existing routes
router.post("/register", ngoController.registerNGO);
router.post("/login", ngoController.loginNGO);
router.get("/:ngoId", ngoController.getNGODetails);

// New route to find nearby NGOs
router.get("/nearby/search", ngoController.findNearbyNGOs);

module.exports = router;

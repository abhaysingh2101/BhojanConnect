const DonorTransaction = require("../models/DonorTransaction");
const Donor = require("../models/Donor");
const NGO = require("../models/NGO");
const mongoose = require("mongoose");

// Record a donor's food donation
const donateFood = async (req, res) => {
  try {
    const { donorId, ngoId, quantity } = req.body;

    // 1️⃣ Check for missing fields
    if (!donorId || !ngoId || !quantity) {
      return res.status(400).json({
        error: "All fields are required: donorId, ngoId, quantity",
      });
    }

    // 2️⃣ Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(donorId) || !mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ error: "Invalid donorId or ngoId format" });
    }

    // 3️⃣ Verify donor and NGO exist
    const donor = await Donor.findById(donorId);
    const ngo = await NGO.findById(ngoId);

    if (!donor || !ngo) {
      return res.status(404).json({ error: "Donor or NGO not found" });
    }

    // 4️⃣ Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // 5️⃣ Create new donation transaction
    const transaction = new DonorTransaction({
      donorId,
      ngoId,
      quantity,
    });

    await transaction.save();

    // 6️⃣ Update NGO’s available plates count
    ngo.platesAvailable += quantity;
    await ngo.save();

    res.status(201).json({
      message: "Donation recorded successfully",
      transaction,
    });
  } catch (err) {
    console.error("Donation error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = { donateFood };

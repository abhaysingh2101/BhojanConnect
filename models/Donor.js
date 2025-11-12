const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  aadhaarNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

const Donor = mongoose.model("Donor", donorSchema);
module.exports = Donor;

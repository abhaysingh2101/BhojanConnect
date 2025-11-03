const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
}, { timestamps: true });

const Recipient = mongoose.model("Recipient", recipientSchema);
module.exports = Recipient;

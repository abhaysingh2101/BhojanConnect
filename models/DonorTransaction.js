// models/DonorTransaction.js
const mongoose = require("mongoose");

const donorTransactionSchema = new mongoose.Schema({
  donorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Donor", 
    required: true 
  },
  ngoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "NGO", 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const DonorTransaction = mongoose.model("DonorTransaction", donorTransactionSchema);
module.exports = DonorTransaction;

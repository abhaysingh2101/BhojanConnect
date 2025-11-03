const mongoose = require("mongoose");

const recipientTransactionSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipient",
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
  transactionType: {
    type: String,
    enum: ["book", "take"], 
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const RecipientTransaction = mongoose.model("RecipientTransaction", recipientTransactionSchema);
module.exports = RecipientTransaction;

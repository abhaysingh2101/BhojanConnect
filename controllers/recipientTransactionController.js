const mongoose = require("mongoose");
const RecipientTransaction = require("../models/RecipientTransaction");
const Recipient = require("../models/Recipient");
const NGO = require("../models/NGO");

// 📦 Book Food API
const bookFood = async (req, res) => {
  try {
    const { recipientId, ngoId, quantity } = req.body;

    // 1️⃣ Check for missing fields
    if (!recipientId || !ngoId || !quantity) {
      return res.status(400).json({
        error: "Recipient ID, NGO ID, and quantity are required."
      });
    }

    // 2️⃣ Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(ngoId)
    ) {
      return res.status(400).json({
        error: "Invalid recipientId or ngoId format"
      });
    }

    // 3️⃣ Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be greater than 0."
      });
    }

    // 4️⃣ Check if NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: "NGO not found." });
    }

    // 5️⃣ Check if plates are available
    if (ngo.platesAvailable < quantity) {
      return res.status(400).json({
        error: "Not enough plates available in the foodbank."
      });
    }

    // 6️⃣ Reduce available plates
    ngo.platesAvailable = Number(ngo.platesAvailable) - quantity;
    await ngo.save();

    // 7️⃣ Create a booking transaction
    const transaction = new RecipientTransaction({
      recipientId,
      ngoId,
      quantity,
      transactionType: "book",
    });
    await transaction.save();

    // 8️⃣ Send success response
    res.status(201).json({
      message: "Food booked successfully!",
      transaction,
      updatedPlates: ngo.platesAvailable,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({
      error: "Server error while booking food.",
      details: err.message,
    });
  }
};

// 🍽️ Take Food API
const takeFood = async (req, res) => {
  try {
    const { recipientId, ngoId, quantity } = req.body;

    // 1️⃣ Validate required fields
    if (!recipientId || !ngoId || !quantity) {
      return res.status(400).json({
        error: "Recipient ID, NGO ID, and quantity are required."
      });
    }

    // 2️⃣ Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(ngoId)
    ) {
      return res.status(400).json({
        error: "Invalid recipientId or ngoId format"
      });
    }

    // 3️⃣ Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be greater than 0."
      });
    }

    // 4️⃣ Convert to ObjectIds for aggregation
    const recipientObjId = new mongoose.Types.ObjectId(recipientId);
    const ngoObjId = new mongoose.Types.ObjectId(ngoId);

    // 5️⃣ Calculate total booked food
    const bookedTransactions = await RecipientTransaction.aggregate([
      { $match: { recipientId: recipientObjId, ngoId: ngoObjId, transactionType: "book" } },
      { $group: { _id: null, totalBooked: { $sum: "$quantity" } } },
    ]);

    // 6️⃣ Calculate total food already taken
    const takenTransactions = await RecipientTransaction.aggregate([
      { $match: { recipientId: recipientObjId, ngoId: ngoObjId, transactionType: "take" } },
      { $group: { _id: null, totalTaken: { $sum: "$quantity" } } },
    ]);

    const totalBooked = bookedTransactions.length ? bookedTransactions[0].totalBooked : 0;
    const totalTaken = takenTransactions.length ? takenTransactions[0].totalTaken : 0;
    const remainingToTake = totalBooked - totalTaken;

    // 7️⃣ Validate if recipient can take more
    if (remainingToTake <= 0) {
      return res.status(400).json({ error: "No booked food available to take." });
    }
    if (quantity > remainingToTake) {
      return res.status(400).json({
        error: `You can only take up to ${remainingToTake} plates.`,
      });
    }

    // 8️⃣ Record the 'take' transaction
    const transaction = new RecipientTransaction({
      recipientId,
      ngoId,
      quantity,
      transactionType: "take",
    });
    await transaction.save();

    res.status(200).json({
      message: "Food taken successfully from the foodbank!",
      transaction,
      remainingAfterTake: remainingToTake - quantity,
    });
  } catch (err) {
    console.error("Take food error:", err);
    res.status(500).json({
      error: "Server error while taking food.",
      details: err.message,
    });
  }
};

// 📋 List Recipients who booked food from an NGO
const listRecipientsBooked = async (req, res) => {
  try {
    const { ngoId } = req.params;

    if (!ngoId) {
      return res.status(400).json({ error: "NGO ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ error: "Invalid ngoId format" });
    }

    const ngoObjId = new mongoose.Types.ObjectId(ngoId);

    const bookings = await RecipientTransaction.aggregate([
      { $match: { ngoId: ngoObjId, transactionType: "book" } },
      { $group: { _id: "$recipientId", totalBooked: { $sum: "$quantity" } } },
      {
        $lookup: {
          from: "recipients",
          localField: "_id",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
      {
        $project: {
          _id: 0,
          recipientId: "$_id",
          name: "$recipientInfo.username",
          email: "$recipientInfo.email",
          totalBooked: 1,
        },
      },
    ]);

    res.status(200).json({ ngoId, recipients: bookings });
  } catch (err) {
    console.error("List recipients error:", err);
    res.status(500).json({
      error: "Server error while fetching booked recipients.",
      details: err.message,
    });
  }
};

module.exports = { bookFood, takeFood, listRecipientsBooked };

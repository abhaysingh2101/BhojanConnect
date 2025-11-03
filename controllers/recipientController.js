const Recipient = require("../models/Recipient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Register recipient
const registerRecipient = async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existing = await Recipient.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRecipient = new Recipient({
      username,
      phone,
      email,
      password: hashedPassword,
    });

    await newRecipient.save();

    res.status(201).json({
      message: "Recipient registered successfully",
      recipient: {
        _id: newRecipient._id,
        username: newRecipient.username,
        email: newRecipient.email,
        phone: newRecipient.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Login recipient
const loginRecipient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const recipient = await Recipient.findOne({ email });
    if (!recipient) {
      return res.status(400).json({ error: "Recipient not found" });
    }

    const isMatch = await bcrypt.compare(password, recipient.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: recipient._id, role: "recipient" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      message: "Login successful",
      token,
      recipient: {
        _id: recipient._id,
        username: recipient.username,
        email: recipient.email,
        phone: recipient.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get recipient profile
const getRecipientProfile = async (req, res) => {
  try {
    const recipient = await Recipient.findById(req.userId).select("-password");
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    res.json(recipient);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const recipientController = {
  registerRecipient,
  loginRecipient,
  getRecipientProfile,
};

module.exports = recipientController;

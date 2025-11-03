const Donor = require("../models/Donor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Register donor
const registerDonor = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existing = await Donor.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDonor = new Donor({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    await newDonor.save();

    const donorResponse = {
      _id: newDonor._id,
      username: newDonor.username,
      email: newDonor.email,
      phone: newDonor.phone,
    };

    res.status(201).json({ message: "Donor registered successfully", donor: donorResponse });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Login donor
const loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const donor = await Donor.findOne({ email });
    if (!donor) return res.status(400).json({ error: "Donor not found" });

    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: donor._id, role: "donor" }, JWT_SECRET, { expiresIn: "12h" });

    res.json({
      message: "Login successful",
      token,
      donor: {
        _id: donor._id,
        username: donor.username,
        email: donor.email,
        phone: donor.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get donor profile
const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.userId).select("-password");
    if (!donor) return res.status(404).json({ error: "Donor not found" });
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = { registerDonor, loginDonor, getDonorProfile };

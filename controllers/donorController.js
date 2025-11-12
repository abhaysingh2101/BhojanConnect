const Donor = require("../models/Donor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Register Donor
const registerDonor = async (req, res) => {
  try {
    const { username, email, password, phone, aadhaarNumber } = req.body;

    // Validation
    if (!username || !email || !password || !aadhaarNumber) {
      return res.status(400).json({ error: "Username, email, password, and Aadhaar number are required" });
    }

    // Validate Aadhaar number (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return res.status(400).json({ error: "Aadhaar number must be a valid 12-digit number" });
    }

    // Check for duplicates
    const existingEmail = await Donor.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: "Email already exists" });

    const existingAadhaar = await Donor.findOne({ aadhaarNumber });
    if (existingAadhaar) return res.status(400).json({ error: "Aadhaar number already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create donor
    const newDonor = new Donor({
      username,
      email,
      password: hashedPassword,
      phone,
      aadhaarNumber,
    });

    await newDonor.save();

    const donorResponse = {
      _id: newDonor._id,
      username: newDonor.username,
      email: newDonor.email,
      phone: newDonor.phone,
      aadhaarNumber: newDonor.aadhaarNumber,
    };

    res.status(201).json({
      message: "Donor registered successfully",
      donor: donorResponse,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Login Donor
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
        aadhaarNumber: donor.aadhaarNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get Donor Profile
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

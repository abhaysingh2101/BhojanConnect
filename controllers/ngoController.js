const NGO = require("../models/NGO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// ✅ Register NGO
const registerNGO = async (req, res) => {
  try {
    const { username, email, password, address, phone, latitude, longitude } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existing = await NGO.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save NGO with GeoJSON location
    const newNGO = new NGO({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // GeoJSON format
      },
    });

    await newNGO.save();

    res.status(201).json({
      message: "NGO registered successfully",
      ngo: {
        _id: newNGO._id,
        username,
        email,
        address,
        phone,
        latitude,
        longitude,
        platesAvailable: newNGO.platesAvailable, // default 0
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Login NGO
const loginNGO = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const ngo = await NGO.findOne({ email });
    if (!ngo) return res.status(400).json({ error: "NGO not found" });

    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: ngo._id, role: "ngo" }, JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      message: "Login successful",
      token,
      ngo: {
        _id: ngo._id,
        username: ngo.username,
        email: ngo.email,
        address: ngo.address,
        phone: ngo.phone,
        latitude: ngo.location.coordinates[1],
        longitude: ngo.location.coordinates[0],
        platesAvailable: ngo.platesAvailable,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Get NGO Profile (Protected)
const getNGOProfile = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.userId).select("-password");
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    res.json({
      _id: ngo._id,
      username: ngo.username,
      email: ngo.email,
      address: ngo.address,
      phone: ngo.phone,
      latitude: ngo.location?.coordinates[1],
      longitude: ngo.location?.coordinates[0],
      platesAvailable: ngo.platesAvailable,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Get NGO Details (for specific NGO ID)
const getNGODetails = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const ngo = await NGO.findById(ngoId).select("username platesAvailable location address phone");

    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    res.json({
      username: ngo.username,
      address: ngo.address,
      phone: ngo.phone,
      platesAvailable: ngo.platesAvailable,
      latitude: ngo.location.coordinates[1],
      longitude: ngo.location.coordinates[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Find Nearby NGOs within 5 km
const findNearbyNGOs = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const nearbyNGOs = await NGO.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 5000, // 5 km radius
        },
      },
    }).select("username address phone platesAvailable location");

    res.json({
      count: nearbyNGOs.length,
      nearbyNGOs,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Export Controller
const ngoController = {
  registerNGO,
  loginNGO,
  getNGOProfile,
  getNGODetails,
  findNearbyNGOs,
};

module.exports = ngoController;

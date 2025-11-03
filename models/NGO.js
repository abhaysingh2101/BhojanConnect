const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  platesAvailable: { type: Number, default: 0 },

  // GeoJSON location field
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

// Create a 2dsphere index for geospatial queries
ngoSchema.index({ location: "2dsphere" });

const NGO = mongoose.model("NGO", ngoSchema);
module.exports = NGO;

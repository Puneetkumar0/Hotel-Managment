const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  type: String,
  price: Number,
  capacity: { type: Number, default: 2 },
  amenities: [String],
  description: String,
  images: [String],
  status: { type: String, enum: ['available', 'not_available'], default: 'available' },
  housekeepingStatus: { type: String, default: "clean" } // clean, dirty, maintenance
});

module.exports = mongoose.model("Room", roomSchema);
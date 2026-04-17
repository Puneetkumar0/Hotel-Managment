const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'], default: 'pending' }, // ...
  totalPrice: Number,
  specialRequests: String,
  paymentStatus: { type: String, default: "pending" }, // pending, paid, refunded
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
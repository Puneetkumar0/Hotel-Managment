const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  address: String,
  dateOfBirth: Date,
  role: { type: String, enum: ['user', 'receptionist', 'manager', 'admin'], default: 'user' },
  preferences: [String] // e.g., smoking, pets
});

module.exports = mongoose.model("User", userSchema);

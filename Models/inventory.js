const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  item: String,
  quantity: Number,
  minThreshold: Number,
  supplier: String,
  lastRestocked: Date
});

module.exports = mongoose.model("Inventory", inventorySchema);
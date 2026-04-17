const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema({
  roomType: String,
  basePrice: Number,
  seasonalMultiplier: { type: Number, default: 1 },
  demandMultiplier: { type: Number, default: 1 },
  discountPercentage: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model("PricingRule", pricingRuleSchema);
const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: String
});

const foodOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true }, // Room number for delivery
  items: [foodItemSchema],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  orderDate: { type: Date, default: Date.now },
  specialInstructions: String
});

module.exports = mongoose.model("FoodOrder", foodOrderSchema);

const mongoose = require('mongoose');

const foodMenuSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Menu item name is required'],
    trim: true
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Dessert']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String, // path like '/images/menu-biryani.jpg'
    default: '/images/default-menu.jpg'
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast queries
foodMenuSchema.index({ category: 1, available: 1 });
foodMenuSchema.index({ available: 1 });

module.exports = mongoose.model('FoodMenu', foodMenuSchema);


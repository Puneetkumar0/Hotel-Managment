const mongoose = require('mongoose');
const FoodMenu = require('../Models/foodMenu');
require('dotenv').config();
const connectDB = require('../config/db');

const seedMenuItems = [
  {
    name: 'American Breakfast',
    category: 'Breakfast',
    price: 250,
    description: 'Eggs, bacon, toast, coffee or tea',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Indian Breakfast',
    category: 'Breakfast',
    price: 200,
    description: 'Poha, paratha, chai',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Veg Biryani',
    category: 'Lunch',
    price: 350,
    description: 'Fragrant basmati rice with mixed vegetables',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Chicken Curry',
    category: 'Lunch',
    price: 400,
    description: 'Tender chicken in rich onion tomato gravy',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Paneer Masala',
    category: 'Dinner',
    price: 380,
    description: 'Cottage cheese cubes in spicy tomato gravy',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Grilled Fish',
    category: 'Dinner',
    price: 450,
    description: 'Fresh fish marinated and grilled to perfection',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Coke (300ml)',
    category: 'Beverages',
    price: 50,
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Fresh Juice',
    category: 'Beverages',
    price: 120,
    description: 'Freshly squeezed orange or watermelon juice',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Ice Cream',
    category: 'Dessert',
    price: 80,
    description: 'Vanilla or chocolate scoop',
    image: '/images/default-menu.jpg'
  },
  {
    name: 'Gulab Jamun',
    category: 'Dessert',
    price: 100,
    description: 'Warm milk dumplings in rose syrup',
    image: '/images/default-menu.jpg'
  }
];

const seedMenu = async () => {
  try {
    await connectDB();

    // Clear existing menu
    await FoodMenu.deleteMany({});

    // Insert new items
    await FoodMenu.insertMany(seedMenuItems);
    console.log(`✅ Seeded ${seedMenuItems.length} menu items successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedMenu();


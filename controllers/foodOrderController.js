const mongoose = require("mongoose");
const FoodOrder = require("../Models/foodOrder");
const Booking = require("../Models/booking");
const User = require("../Models/user");

const FoodMenu = require("../Models/foodMenu");

exports.getMenu = async (req, res) => {  
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  try {
    const menuItems = await FoodMenu.find({ available: true })
      .sort({ category: 1, name: 1 })
      .lean();
    res.render("food-menu", { menuItems, userId: req.session.userId });
  } catch (err) {
    console.error("Load menu error:", err);
    res.status(500).send("Failed to load menu");
  }
};

exports.placeOrder = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const userId = req.session.userId;
    const { roomNumber, items, specialInstructions } = req.body;

    // Parse items from form data
    const orderItems = [];
    let totalPrice = 0;

    // Expect items as JSON string or array processing
    let parsedItems;
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items.trim() || '[]') : items || [];
    } catch {
      parsedItems = [];
    }

    if (!Array.isArray(parsedItems)) {
      parsedItems = [];
    }

    for (let item of parsedItems) {
      if (!item || typeof item !== 'object') continue;
      const itemId = (item.id || item._id || '').toString().trim();
      if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) continue;

      const menuItem = await FoodMenu.findOne({ 
        _id: itemId, 
        available: true 
      }).lean();
      if (menuItem && item.quantity > 0) {
        const itemTotal = menuItem.price * item.quantity;
        orderItems.push({
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          notes: item.notes || ''
        });
        totalPrice += itemTotal;
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).send("No valid items selected");
    }

    // Find current booking/room for user to get room number if not provided
    const currentBooking = await Booking.findOne({ 
      user: userId, 
      status: 'checked-in' 
    }).populate('room');

    const finalRoomNumber = roomNumber || (currentBooking?.room?.roomNumber || 'Not specified');

    const foodOrder = await FoodOrder.create({
      user: userId,
      roomNumber: finalRoomNumber,
      items: orderItems,
      totalPrice,
      specialInstructions
    });

    res.render("food-order-success", { order: foodOrder, roomNumber: finalRoomNumber });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).send("Error placing order");
  }
};

exports.getUserOrders = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  try {
    const orders = await FoodOrder.find({ user: req.session.userId })
      .sort({ orderDate: -1 })
      .lean();
    res.json(orders); // For AJAX if needed, or render
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json([]);
  }
};

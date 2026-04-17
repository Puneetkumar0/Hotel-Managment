const mongoose = require("mongoose");
const FoodOrder = require("../Models/foodOrder");
const Booking = require("../Models/booking");
const User = require("../Models/user");

const FoodMenu = require("../Models/foodMenu");

const defaultMenuItems = [
  {
    name: 'American Breakfast',
    category: 'Breakfast',
    price: 250,
    description: 'Eggs, bacon, toast, coffee or tea',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Indian Breakfast',
    category: 'Breakfast',
    price: 200,
    description: 'Poha, paratha, chai',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Veg Biryani',
    category: 'Lunch',
    price: 350,
    description: 'Fragrant basmati rice with mixed vegetables',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Chicken Curry',
    category: 'Lunch',
    price: 400,
    description: 'Tender chicken in rich onion tomato gravy',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Paneer Masala',
    category: 'Dinner',
    price: 380,
    description: 'Cottage cheese cubes in spicy tomato gravy',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Grilled Fish',
    category: 'Dinner',
    price: 450,
    description: 'Fresh fish marinated and grilled to perfection',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Coke (300ml)',
    category: 'Beverages',
    price: 50,
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Fresh Juice',
    category: 'Beverages',
    price: 120,
    description: 'Freshly squeezed orange or watermelon juice',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Ice Cream',
    category: 'Dessert',
    price: 80,
    description: 'Vanilla or chocolate scoop',
    image: '/images/default-menu.jpg',
    available: true
  },
  {
    name: 'Gulab Jamun',
    category: 'Dessert',
    price: 100,
    description: 'Warm milk dumplings in rose syrup',
    image: '/images/default-menu.jpg',
    available: true
  }
];

exports.getMenu = async (req, res) => {  
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  try {
    let menuItems = await FoodMenu.find({ available: true })
      .sort({ category: 1, name: 1 })
      .lean();

    if (menuItems.length === 0) {
      await FoodMenu.insertMany(defaultMenuItems);
      menuItems = await FoodMenu.find({ available: true })
        .sort({ category: 1, name: 1 })
        .lean();
    }

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

exports.cancelOrder = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const order = await FoodOrder.findOne({ 
      _id: req.params.id, 
      user: req.session.userId 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Admin functions for managing food orders
exports.adminGetOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find({})
      .populate("user", "name email")
      .sort({ orderDate: -1 })
      .lean();
    res.render("admin/food-orders", { orders, pageTitle: "Food Orders Management", page: "food-orders" });
  } catch (err) {
    console.error("Admin get orders error:", err);
    res.status(500).send("Error loading food orders");
  }
};

exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await FoodOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.adminDeleteOrder = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    await FoodOrder.findByIdAndDelete(req.params.id);
    res.redirect('/admin/food-orders');
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Error deleting order");
  }
};

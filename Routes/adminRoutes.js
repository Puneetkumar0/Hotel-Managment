const express = require("express");
const router = express.Router();
const Room = require("../Models/room");
const Booking = require("../Models/booking");
const roomController = require("../controllers/roomController");
const upload = require("../config/upload");

// Room Management Page
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ roomNumber: 1 }).lean();
    res.render("admin-rooms", { rooms, pageTitle: "Room Management" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Display form to add a new room
router.get("/rooms/add", (req, res) => {
  res.render("add-room", { pageTitle: "Add New Room" });
});

// Handle adding a new room with image upload
router.post("/rooms/add", upload.single("image"), roomController.addRoom);

// Display form to edit a room
router.get("/rooms/edit/:id", roomController.getEditRoomForm);

// Handle editing a room
router.post("/rooms/edit/:id", upload.single("image"), roomController.updateRoom);

// Handle deleting a room
router.post("/rooms/delete/:id", roomController.deleteRoom);

// Handle toggling room status
router.post("/rooms/toggle/:id", roomController.toggleRoomStatus);

// Food Menu Management
const foodMenuRoutes = require('./foodMenuRoutes');
router.use('/food-menu', foodMenuRoutes);

// Food Orders Management
const foodOrderController = require('../controllers/foodOrderController');
router.get('/food-orders', foodOrderController.adminGetOrders);
router.post('/food-orders/update-status/:id', foodOrderController.adminUpdateOrderStatus);
router.get('/food-orders/delete/:id', foodOrderController.adminDeleteOrder);

// Booking Management Page
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email")
      .populate("room", "roomNumber type")
      .sort({ checkIn: -1 });
    res.render("admin-bookings", { bookings, pageTitle: "All Bookings" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Cancel a booking and free up the room
router.get("/bookings/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      // Mark booking as cancelled
      booking.status = "cancelled";
      await booking.save();
      // Update room status back to available (if the room hasn't been deleted)
      if (booking.room) {
        await Room.findByIdAndUpdate(booking.room, { status: "available" });
      }
    }
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send("Server Error");
  }
});

// Update booking status
router.post("/bookings/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // If status is cancelled, free up the room
    if (status === 'cancelled' && booking.room) {
      await Room.findByIdAndUpdate(booking.room, { status: "available" });
    }

    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
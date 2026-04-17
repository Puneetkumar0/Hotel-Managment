const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const Room = require("../Models/room");

router.get("/", roomController.getRooms);
router.get("/api/status", roomController.getRoomsStatus);

// Admin rooms management page
router.get("/admin", async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ roomNumber: 1 }).lean();
    res.render("admin-rooms", { rooms, pageTitle: "Room Management" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

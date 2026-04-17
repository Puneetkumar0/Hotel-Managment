const Room = require("../Models/room");

exports.getHousekeeping = async (req, res) => {
  try {
    const rooms = await Room.find().sort("roomNumber");
    res.render("admin/housekeeping", { rooms });
  } catch (err) {
    res.status(500).send("Error loading housekeeping");
  }
};

exports.updateHousekeepingStatus = async (req, res) => {
  const { roomId, status } = req.body;
  try {
    await Room.findByIdAndUpdate(roomId, { housekeepingStatus: status });
    res.redirect("/admin/housekeeping");
  } catch (err) {
    res.status(500).send("Error updating status");
  }
};
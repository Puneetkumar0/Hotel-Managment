const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRooms);
router.get("/api/status", roomController.getRoomsStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");

router.get("/availability", channelController.getAvailability);
router.post("/booking", channelController.createBooking);

module.exports = router;
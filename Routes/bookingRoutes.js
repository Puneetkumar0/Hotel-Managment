const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/:roomId", bookingController.getBookingForm);
router.post("/", bookingController.bookRoom);
router.post("/:bookingId/checkin", bookingController.checkIn);
router.post("/:bookingId/checkout", bookingController.checkOut);


module.exports = router;

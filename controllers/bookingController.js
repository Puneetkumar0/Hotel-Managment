const Booking = require("../Models/booking");
const Room = require("../Models/room");
const User = require("../Models/user");
const notificationService = require("../services/notificationService");

// Admin booking management functions
exports.adminApprove = async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'confirmed' });
    res.redirect('/admin/bookings');
  } catch (err) {
    res.status(500).send('Error');
  }
};

exports.adminReject = async (req, res) => {
  try {
    const reason = req.body.reason || 'No reason provided';
    await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'cancelled', specialRequests: reason });
    res.redirect('/admin/bookings');
  } catch (err) {
    res.status(500).send('Error');
  }
};

exports.adminCancel = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room');
    await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'cancelled' });
    if (booking.room) await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
    res.redirect('/admin/bookings');
  } catch (err) {
    res.status(500).send('Error');
  }
};

exports.getBookingForm = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Check if room is currently available
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const currentBooking = await Booking.findOne({
      room: req.params.roomId,
      checkOut: { $gt: currentDate },
      status: { $ne: 'cancelled' }
    });

    if (currentBooking) {
      return res.send("Sorry, this room is currently booked and not available for booking.");
    }

    res.render("booking", { room, userId: req.session.userId });
  } catch (err) {
    console.error("Error loading booking form:", err);
    res.status(500).send("Error loading room");
  }
};

exports.bookRoom = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const { roomId, checkIn, checkOut, specialRequests } = req.body;
  const userId = req.session.userId;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return res.send("Invalid dates");
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Check overlap (exclude cancelled)
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['pending', 'confirmed', 'checked-in', 'checked-out'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
        { checkIn: { $lte: checkOutDate, $gte: checkInDate } }
      ]
    });

    if (existingBooking) {
      return res.send("Sorry, this room is already booked for the selected dates. Please choose different dates or select another room.");
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const booking = await Booking.create({
      user: userId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      specialRequests
    });

    // Send confirmation email (pending status)
    const user = await User.findById(userId);
    await notificationService.sendBookingConfirmation(booking, user);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).send("Error creating booking");
  }
};

exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room');
    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    if (booking.status !== 'confirmed') {
      return res.send("Booking must be confirmed first.");
    }

    // Check date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    if (today < checkInDate) {
      return res.send("Check-in not available yet.");
    }

    await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'checked-in' });
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).send("Error during check-in");
  }
};

exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room');
    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'checked-out', paymentStatus: 'paid' });
    await Room.findByIdAndUpdate(booking.room._id, { status: 'available', housekeepingStatus: 'dirty' });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).send("Error during check-out");
  }
};

const Room = require("../Models/room");
const Booking = require("../Models/booking");

// API for OTAs to get availability
exports.getAvailability = async (req, res) => {
  try {
    const { checkin, checkout, roomType } = req.query;
    const checkInDate = new Date(checkin);
    const checkOutDate = new Date(checkout);

    let query = {};
    if (roomType) query.type = roomType;

    const rooms = await Room.find(query);

    const availableRooms = [];
    for (const room of rooms) {
      const overlappingBookings = await Booking.find({
        room: room._id,
        $and: [
          { checkIn: { $lt: checkOutDate } },
          { checkOut: { $gt: checkInDate } }
        ]
      });

      if (overlappingBookings.length === 0 && room.status === "available") {
        availableRooms.push({
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          amenities: room.amenities
        });
      }
    }

    res.json({ availableRooms });
  } catch (err) {
    res.status(500).json({ error: "Error fetching availability" });
  }
};

// API for OTAs to create booking
exports.createBooking = async (req, res) => {
  try {
    const { roomNumber, checkIn, checkOut, guestName, guestEmail } = req.body;

    const room = await Room.findOne({ roomNumber: parseInt(roomNumber) });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check availability
    const existingBooking = await Booking.findOne({
      room: room._id,
      $or: [
        { checkIn: { $lte: checkInDate }, checkOut: { $gt: checkInDate } },
        { checkIn: { $lt: checkOutDate }, checkOut: { $gte: checkOutDate } },
        { checkIn: { $gte: checkInDate }, checkOut: { $lte: checkOutDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ error: "Room not available" });
    }

    // Create guest user if not exists
    let guestUser = await require("../Models/user").findOne({ email: guestEmail });
    if (!guestUser) {
      guestUser = await require("../Models/user").create({
        name: guestName,
        email: guestEmail,
        password: "temp123" // Temporary password
      });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const booking = await Booking.create({
      user: guestUser._id,
      room: room._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'confirmed'
    });

    res.json({ bookingId: booking._id, status: "confirmed" });
  } catch (err) {
    res.status(500).json({ error: "Error creating booking" });
  }
};
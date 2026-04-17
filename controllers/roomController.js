const Booking = require("../Models/booking");
const Room = require("../Models/room");

// Get current room statuses for dashboard API
exports.getRoomsStatus = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const allRooms = await Room.find().sort("roomNumber");

    const roomsWithStatus = await Promise.all(
      allRooms.map(async (room) => {
        const currentBooking = await Booking.findOne({
          room: room._id,
          checkOut: { $gt: currentDate },
          status: { $ne: 'cancelled' }
        }).sort({ checkOut: 1 });

        const isAvailable = room.status === 'available' && !currentBooking;
        const statusDisplay = isAvailable ? 'Available' : 
                             (room.status === 'not_available' ? 'Maintenance' : 'Occupied');
        const housekeepingDisplay = room.housekeepingStatus || 'Clean';

        return {
          id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price,
          status: statusDisplay,
          housekeepingStatus: housekeepingDisplay,
          isAvailable
        };
      })
    );

    res.json({ rooms: roomsWithStatus, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Error fetching room statuses:", err);
    res.status(500).json({ error: "Failed to fetch room statuses" });
  }
};


exports.getRooms = async (req, res) => {
  try {
const { city, checkin, checkout, type, search, page: pageQuery } = req.query;
    const searchParams = { city: city || '', checkin: checkin || '', checkout: checkout || '' };
    const filters = { type: type || 'all', search: search || '' };
    const page = Math.max(1, parseInt(pageQuery) || 1);
    const limit = 6;

    let roomsWithAvailability;

    if (checkin && checkout) {
      const checkInDate = new Date(checkin);
      const checkOutDate = new Date(checkout);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
        return res.render("room", { rooms: [], searchParams, pagination: { page: 1, totalPages: 1, total: 0 } });
      }

      let query = {};
      if (type && type !== 'all') query.type = type;
      if (search) {
        const roomNumberValue = Number(search);
        const orConditions = [
          { type: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
        if (!Number.isNaN(roomNumberValue)) {
          orConditions.unshift({ roomNumber: roomNumberValue });
        }
        query.$or = orConditions;
      }
      const allRooms = await Room.find(query).select("_id roomNumber type price status description images").sort("roomNumber");

      roomsWithAvailability = await Promise.all(
        allRooms.map(async (room) => {
          const overlappingBookings = await Booking.find({
            room: room._id,
            $and: [
              { checkIn: { $lt: checkOutDate } },
              { checkOut: { $gt: checkInDate } }
            ]
          });

          const isAvailable = overlappingBookings.length === 0 && room.status === "available";

          let nextAvailableDate = null;
          if (!isAvailable && overlappingBookings.length > 0) {
            const earliestCheckOut = overlappingBookings.reduce((earliest, b) => {
              return b.checkOut < earliest ? b.checkOut : earliest;
            }, new Date("2100-01-01"));
            nextAvailableDate = earliestCheckOut;
          }

          return {
            ...room.toObject(),
            isAvailable,
            nextAvailableDate
          };
        })
      );

      roomsWithAvailability = roomsWithAvailability.filter(room => room.isAvailable);

      // Apply type and search filters after availability filter
      roomsWithAvailability = roomsWithAvailability.filter(room => {
        if (type && type !== 'all' && room.type !== type) return false;
        if (search) {
          const text = (room.roomNumber + room.type + (room.description || '')).toLowerCase();
          if (!text.includes(search.toLowerCase())) return false;
        }
        return true;
      });
    } else {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      let query = {};
      if (type && type !== 'all') query.type = type;
      if (search) {
        const roomNumberValue = Number(search);
        const orConditions = [
          { type: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
        if (!Number.isNaN(roomNumberValue)) {
          orConditions.unshift({ roomNumber: roomNumberValue });
        }
        query.$or = orConditions;
      }
      const allRooms = await Room.find(query).select("_id roomNumber type price status description images").sort("roomNumber");

      roomsWithAvailability = await Promise.all(
        allRooms.map(async (room) => {
          const currentBooking = await Booking.findOne({
            room: room._id,
            checkOut: { $gt: currentDate }
          }).sort({ checkOut: -1 });

          let isAvailable = room.status === "available";
          let nextAvailableDate = null;

          if (currentBooking && currentBooking.checkOut > currentDate) {
            isAvailable = false;
            nextAvailableDate = currentBooking.checkOut;
          }

          return {
            ...room.toObject(),
            isAvailable,
            nextAvailableDate
          };
        })
      );
    }

    // Pagination
    const total = roomsWithAvailability.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRooms = roomsWithAvailability.slice((page - 1) * limit, page * limit);

    const pagination = {
      page,
      totalPages,
      total,
      hasPrev: page > 1,
      hasNext: page < totalPages
    };

    res.render("room", { rooms: paginatedRooms, searchParams, pagination, filters });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).send(`Error loading rooms: ${err.message}`);
  }
};

exports.addRoom = async (req, res) => {
  const { roomNumber, type, price, capacity, amenities, description } = req.body;
  
  let images = [];
  if (req.file) {
    images.push('/images/' + req.file.filename);
  }

  try {
    await Room.create({
      roomNumber: parseInt(roomNumber),
      type,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      description,
      images: images
    });
    res.redirect("/rooms");
  } catch (err) {
    console.error("Error adding room:", err);
    res.status(500).send("Error adding room");
  }
};

// Show the form to edit a room
exports.getEditRoomForm = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).send("Room not found");
    }
    res.render("edit-room", { room, pageTitle: "Edit Room" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Update a room after form submission
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, type, price, capacity, amenities, description, status } = req.body;
    const updateData = {
      roomNumber: parseInt(roomNumber),
      type,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      description,
      status: status || 'available'
    };

    if (req.file) {
      // A new image was uploaded, update the images array
      updateData.images = ['/images/' + req.file.filename];
    }

    await Room.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).send("Error updating room");
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    const activeBookings = await Booking.countDocuments({
      room: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] }
    });

    if (activeBookings > 0) {
      return res.status(400).send("Cannot delete room with active bookings. Please cancel or complete bookings first.");
    }

    await Room.findByIdAndDelete(req.params.id);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).send("Error deleting room");
  }
};

// Toggle room status between available and not_available
exports.toggleRoomStatus = async (req, res) => {
  try {
    const roomId = req.params.id;
    const newStatus = req.body.status;

    if (!['available', 'not_available'].includes(newStatus)) {
      return res.status(400).send("Invalid status");
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    room.status = newStatus;
    await room.save();

    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("Error toggling room status:", error);
    res.status(500).send("Error toggling status");
  }
};


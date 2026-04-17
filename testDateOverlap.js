// Test script to demonstrate date overlap checking
const mongoose = require("mongoose");
require("dotenv").config();

const Booking = require("./Models/booking");
const Room = require("./Models/room");

async function testDateOverlap() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get first room for testing
    const room = await Room.findOne();
    if (!room) {
      console.log("No rooms found. Run seedRooms.js first.");
      return;
    }

    console.log(`Testing with Room ${room.roomNumber} (${room.type})`);
    console.log("=====================================\n");

    // Test Case 1: Create initial booking (Jan 15-20, 2026)
    console.log("Test Case 1: Creating initial booking (Jan 15-20, 2026)");
    const booking1 = await Booking.create({
      user: new mongoose.Types.ObjectId(), // dummy user ID
      room: room._id,
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-20")
    });
    console.log("✅ Initial booking created\n");

    // Test Case 2: Try to book overlapping dates (Jan 18-22) - Should FAIL
    console.log("Test Case 2: Trying to book overlapping dates (Jan 18-22) - Should FAIL");
    const overlapCheck1 = await Booking.findOne({
      room: room._id,
      $or: [
        {
          $and: [
            { checkIn: { $lte: new Date("2026-01-18") } },
            { checkOut: { $gt: new Date("2026-01-18") } }
          ]
        },
        {
          $and: [
            { checkIn: { $lt: new Date("2026-01-22") } },
            { checkOut: { $gte: new Date("2026-01-22") } }
          ]
        },
        {
          $and: [
            { checkIn: { $gte: new Date("2026-01-18") } },
            { checkOut: { $lte: new Date("2026-01-22") } }
          ]
        }
      ]
    });

    if (overlapCheck1) {
      console.log("❌ OVERLAP DETECTED - Booking would be blocked");
    } else {
      console.log("✅ No overlap - Booking would be allowed");
    }
    console.log();

    // Test Case 3: Try to book non-overlapping dates (Jan 21-25) - Should PASS
    console.log("Test Case 3: Trying to book non-overlapping dates (Jan 21-25) - Should PASS");
    const overlapCheck2 = await Booking.findOne({
      room: room._id,
      $or: [
        {
          $and: [
            { checkIn: { $lte: new Date("2026-01-21") } },
            { checkOut: { $gt: new Date("2026-01-21") } }
          ]
        },
        {
          $and: [
            { checkIn: { $lt: new Date("2026-01-25") } },
            { checkOut: { $gte: new Date("2026-01-25") } }
          ]
        },
        {
          $and: [
            { checkIn: { $gte: new Date("2026-01-21") } },
            { checkOut: { $lte: new Date("2026-01-25") } }
          ]
        }
      ]
    });

    if (overlapCheck2) {
      console.log("❌ OVERLAP DETECTED - Booking would be blocked");
    } else {
      console.log("✅ No overlap - Booking would be allowed");
    }
    console.log();

    // Test Case 4: Try to book dates that completely contain existing booking (Jan 10-25) - Should FAIL
    console.log("Test Case 4: Trying to book dates containing existing booking (Jan 10-25) - Should FAIL");
    const overlapCheck3 = await Booking.findOne({
      room: room._id,
      $or: [
        {
          $and: [
            { checkIn: { $lte: new Date("2026-01-10") } },
            { checkOut: { $gt: new Date("2026-01-10") } }
          ]
        },
        {
          $and: [
            { checkIn: { $lt: new Date("2026-01-25") } },
            { checkOut: { $gte: new Date("2026-01-25") } }
          ]
        },
        {
          $and: [
            { checkIn: { $gte: new Date("2026-01-10") } },
            { checkOut: { $lte: new Date("2026-01-25") } }
          ]
        }
      ]
    });

    if (overlapCheck3) {
      console.log("❌ OVERLAP DETECTED - Booking would be blocked");
    } else {
      console.log("✅ No overlap - Booking would be allowed");
    }
    console.log();

    // Clean up test data
    await Booking.deleteMany({ room: room._id });
    console.log("🧹 Test data cleaned up");

    mongoose.connection.close();
  } catch (err) {
    console.error("Test error:", err);
    mongoose.connection.close();
  }
}

testDateOverlap();
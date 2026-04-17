const mongoose = require("mongoose");
require("dotenv").config();
const Room = require("../Models/room");

const seedRooms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing rooms
    await Room.deleteMany({});
    console.log("Cleared existing rooms");

    // Create room data: 3 AC rooms + 10 Duplex rooms = 13 total
    const rooms = [
      // AC Rooms (3)
      { roomNumber: 101, type: "AC", price: 3500, capacity: 2, amenities: ["WiFi", "AC", "TV", "Mini Bar"], description: "Comfortable AC room with modern amenities", status: "available" },
      { roomNumber: 102, type: "AC", price: 3500, capacity: 2, amenities: ["WiFi", "AC", "TV", "Mini Bar"], description: "Comfortable AC room with modern amenities", status: "available" },
      { roomNumber: 103, type: "AC", price: 3500, capacity: 2, amenities: ["WiFi", "AC", "TV", "Mini Bar"], description: "Comfortable AC room with modern amenities", status: "available" },
      
      // Duplex Rooms (10)
      { roomNumber: 201, type: "Duplex", price: 3500, capacity: 4, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 202, type: "Duplex", price: 3500, capacity: 4, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 203, type: "Duplex", price: 3500, capacity: 4, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 204, type: "Duplex", price: 3500, capacity: 4, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 205, type: "Single", price: 1500, capacity: 1, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 206, type: "double", price: 3500, capacity: 2, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 207, type: "double", price: 3500, capacity: 2, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 208, type: "Single", price: 1500, capacity: 1, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 209, type: "Single", price: 1500, capacity: 1, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
      { roomNumber: 210, type: "Duplex", price: 3500, capacity: 4, amenities: ["WiFi", "TV"], description: "Spacious duplex room for families", status: "available" },
    ];

    // Insert rooms
    const insertedRooms = await Room.insertMany(rooms);
    console.log(`✓ Successfully added ${insertedRooms.length} rooms`);
    console.log("AC Rooms: 3 (Rooms 101-103)");
    console.log("Duplex Rooms: 4 (Rooms 201-204)");
    

    // Display all rooms
    const allRooms = await Room.find();
    console.log("\nAll Rooms in Database:");
    console.table(allRooms);

    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding rooms:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedRooms();

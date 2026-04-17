const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../Models/user");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hotelbooking");

    const adminEmail = "admin@hotel.com";
    const adminPassword = "admin123";

    // Check if admin exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log("Admin user exists. Updating password to hashed version...");
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log("Admin password updated successfully!");
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = {
        name: "Hotel Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      };
      await User.create(adminUser);
      console.log("New admin user created successfully!");
    }
    
    console.log(`Admin credentials:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("Ready for login!");

  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();

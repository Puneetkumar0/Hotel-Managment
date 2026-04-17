const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../Models/user");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hotelbooking");

    const testEmail = "pk2006@gmail.com";
    const testPassword = "password123";

    // Check if test user exists
    let testUser = await User.findOne({ email: testEmail });
    
    if (testUser) {
      console.log("Test user exists. Updating password...");
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      testUser.password = hashedPassword;
      await testUser.save();
      console.log("Test user password updated!");
    } else {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      testUser = await User.create({
        name: "Test User",
        email: testEmail,
        password: hashedPassword,
        phone: "1234567890",
        role: "user"
      });
      console.log("New test user created!");
    }
    
    console.log(`Test User Credentials:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log("Login now works! Ready at http://localhost:3000/login");

  } catch (err) {
    console.error("Error seeding test user:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedTestUser();


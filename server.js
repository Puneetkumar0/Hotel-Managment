const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

const User = require("./Models/user");
const bcrypt = require("bcryptjs");

// Auto-create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@hotel.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@hotel.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Default admin created! Email: admin@hotel.com | Password: admin123 (hashed)");
    } else {
      console.log("Admin account (admin@hotel.com) already exists and is ready to use. Password: admin123");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};
// Middleware
const session = require("express-session");
app.use(session({
  secret: "hotelbookingsecret",
  resave: false,
  saveUninitialized: false
}));

const flash = require('connect-flash');
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs"); 

app.use(async (req, res, next) => {
  res.locals.user = null;
  res.locals.userId = req.session.userId || null;
  res.locals.isAdmin = false;

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();
      if (user) {
        res.locals.user = user;
        res.locals.userId = user._id;
        res.locals.isAdmin = user.role === "admin";
      }
    } catch (err) {
      console.error("Middleware user load error:", err);
    }
  }

  // Make flash messages available in templates
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  next();
});

// Admin protection middleware
const requireAdmin = (req, res, next) => {
  if (!res.locals.isAdmin) {
    return res.redirect("/login");
  }
  next();
};

// Routes
app.use("/", require("./Routes/userRoutes"));
app.use("/rooms", require("./Routes/roomRoutes"));
app.use("/booking", require("./Routes/bookingRoutes"));
app.use("/food", require("./Routes/foodOrderRoutes"));
app.use("/admin", requireAdmin, require("./Routes/adminRoutes"));
app.use("/admin", requireAdmin, require("./Routes/revenueRoutes"));
app.use("/admin", requireAdmin, require("./Routes/housekeepingRoutes"));
app.use("/admin", requireAdmin, require("./Routes/inventoryRoutes"));
app.use("/admin/staff", requireAdmin, require("./Routes/staffRoutes"));
app.use("/api/channel", require("./Routes/channelRoutes"));

// Start server only after database is connected
const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();

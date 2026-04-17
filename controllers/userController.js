const User = require("../Models/user");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res) => {
  res.render("register");
};

exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });
  res.redirect("/login");
};

exports.getLogin = (req, res) => {
  res.render("login");
};

exports.postLogin = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const passwordInput = (req.body.password || '').trim();

  console.log('Login attempt for email:', email);

  const user = await User.findOne({ email: email });

  if (!user || !(await bcrypt.compare(passwordInput, user.password))) {
    console.log('Login failed - invalid credentials for:', email);
    return res.render('login', { error: 'User id or password invalid' });
  }

  req.session.userId = user._id;

  console.log("User logged in:", user.email, "Role:", user.role);

  if (user.role === "admin") {
    console.log("Redirecting admin to /admin");
    return res.redirect("/admin");
  }

  console.log("Redirecting user to /rooms");
  res.redirect("/rooms");
};

exports.getSupport = (req, res) => {
  res.render("support", { userId: req.session.userId });
};

exports.postSupport = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Here you could save the support message to database or send email
  // For now, just show a success message
  console.log("Support message received:", { name, email, subject, message });

  res.send(`
    <h2>Thank you for contacting Ak Support Us!</h2>
    <p>Your message has been received. We'll get back to you within 24 hours.</p>
    <a href="/support">Back to Support</a> | <a href="/">Home</a>
  `);
};

exports.getDashboard = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  if (res.locals.isAdmin) {
    return res.redirect("/admin");
  }

  try {
const FoodOrder = require("../Models/foodOrder");
  const Booking = require("../Models/booking");
    const orders = await FoodOrder.find({ user: req.session.userId }).sort({ orderDate: -1 }).lean();
    
    // Fetch user's bookings
    const bookings = await Booking.find({ 
        user: req.session.userId, 
        room: { $ne: null, $ne: undefined }
      })
      .populate('room')
      .sort({ createdAt: -1 })
      .lean();
    
    res.render("dashboard", { foodOrders: orders, bookings });
  } catch (err) {
    console.error("Dashboard food orders error:", err);
    res.redirect("/booking/dashboard");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
};

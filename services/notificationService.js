const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendBookingConfirmation = async (booking, user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Booking Confirmation",
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed.</p>
      <p>Check-in: ${booking.checkIn.toDateString()}</p>
      <p>Check-out: ${booking.checkOut.toDateString()}</p>
      <p>Total: $${booking.totalPrice}</p>
      <p>Thank you for choosing our hotel!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.sendCheckInReminder = async (booking, user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Check-in Reminder",
    html: `
      <h2>Check-in Tomorrow!</h2>
      <p>Dear ${user.name},</p>
      <p>Don't forget your check-in tomorrow at ${booking.checkIn.toDateString()}.</p>
      <p>You can check-in online or at the front desk.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Check-in reminder sent");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};
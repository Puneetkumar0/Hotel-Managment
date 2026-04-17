const PricingRule = require("../Models/pricingRule");
const Booking = require("../Models/booking");
const Room = require("../Models/room");

exports.getPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().sort({ createdAt: -1 });
    res.render("admin/pricing", { rules });
  } catch (err) {
    res.status(500).send("Error loading pricing rules");
  }
};

exports.addPricingRule = async (req, res) => {
  const { roomType, basePrice, seasonalMultiplier, demandMultiplier, discountPercentage, startDate, endDate } = req.body;
  try {
    await PricingRule.create({
      roomType,
      basePrice: parseFloat(basePrice),
      seasonalMultiplier: parseFloat(seasonalMultiplier),
      demandMultiplier: parseFloat(demandMultiplier),
      discountPercentage: parseFloat(discountPercentage),
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    res.redirect("/admin/pricing");
  } catch (err) {
    res.status(500).send("Error adding pricing rule");
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['checked-out', 'paid'] }
    }).populate('room');

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Occupancy rate
    const totalRooms = await Room.countDocuments();
    const occupiedDays = bookings.reduce((sum, b) => {
      const nights = Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) * totalRooms;
    const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

    const revpar = totalDays > 0 ? totalRevenue / totalDays : 0;

    res.render("admin/reports", {
      totalRevenue,
      totalBookings,
      avgRevenuePerBooking,
      occupancyRate,
      revpar,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(500).send("Error generating report");
  }
};
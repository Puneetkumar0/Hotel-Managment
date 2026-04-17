const User = require('../Models/user');

exports.getStaffList = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    res.render('admin/staff', { users, title: 'Staff Management' });
  } catch (err) {
    res.status(500).send('Error loading staff');
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    await User.findByIdAndUpdate(userId, { role });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role });
    res.redirect('/admin/staff');
  } catch (err) {
    res.status(500).send('Error creating staff');
  }
};

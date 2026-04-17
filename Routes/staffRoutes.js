const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getStaffList);
router.post('/create', staffController.createStaff);
router.post('/update-role', staffController.updateRole);

module.exports = router;

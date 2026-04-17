const express = require('express');
const router = express.Router();
const foodMenuController = require('../controllers/foodMenuController');

const upload = require("../config/upload");

// Admin routes - protect with middleware in adminRoutes
router.get('/', foodMenuController.adminListMenu);
router.get('/add', foodMenuController.adminAddForm);
router.post('/add', upload.single('image'), foodMenuController.adminAddItem);
router.get('/:id/edit', foodMenuController.adminEditForm);
router.post('/:id/update', upload.single('image'), foodMenuController.adminUpdateItem);
router.post('/:id/delete', foodMenuController.adminDeleteItem);
router.post('/:id/toggle', foodMenuController.toggleAvailability);

module.exports = router;


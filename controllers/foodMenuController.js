const FoodMenu = require('../Models/foodMenu');
const path = require('path');

// List all menu items for admin
exports.adminListMenu = async (req, res) => {
  try {
    const { category, available, search, page = 1 } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (available === 'true') query.available = true;
    if (available === 'false') query.available = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await FoodMenu.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FoodMenu.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.render('admin/food-menu', { 
      items,
      totalPages,
      pagination: { page: parseInt(page), totalPages, total },
      filters: req.query,
      categories: ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Dessert']
    });
  } catch (err) {
    console.error('List menu error:', err);
    res.status(500).render('error', { message: 'Failed to load menu items' });
  }
};

// Show add form
exports.adminAddForm = (req, res) => {
  res.render('admin/add-menu', { 
    item: {},
    categories: ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Dessert']
  });
};

// Add new menu item
exports.adminAddItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let imagePath = '/images/default-menu.jpg';

    if (req.file) {
      imagePath = `/images/${req.file.filename}`;
    }

    const newItem = new FoodMenu({
      name,
      category,
      price: parseFloat(price),
      description,
      image: imagePath
    });

    await newItem.save();
    req.flash('success', 'Menu item added successfully!');
    res.redirect('/admin/food-menu');
  } catch (err) {
    console.error('Add item error:', err);
    req.flash('error', err.message);
    res.redirect('/admin/food-menu/add');
  }
};

// Edit form
exports.adminEditForm = async (req, res) => {
  try {
    const item = await FoodMenu.findById(req.params.id);
    if (!item) {
      req.flash('error', 'Menu item not found');
      return res.redirect('/admin/food-menu');
    }
    res.render('admin/edit-menu', { 
      item,
      categories: ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Dessert']
    });
  } catch (err) {
    console.error('Edit form error:', err);
    res.status(500).render('error', { message: 'Item not found' });
  }
};

// Update menu item
exports.adminUpdateItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const updateData = {
      name,
      category,
      price: parseFloat(price),
      description
    };

    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    await FoodMenu.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Menu item updated successfully!');
    res.redirect('/admin/food-menu');
  } catch (err) {
    console.error('Update error:', err);
    req.flash('error', err.message);
    res.redirect(`/admin/food-menu/${req.params.id}/edit`);
  }
};

// Delete menu item
exports.adminDeleteItem = async (req, res) => {
  try {
    await FoodMenu.findByIdAndDelete(req.params.id);
    req.flash('success', 'Menu item deleted successfully!');
    res.redirect('/admin/food-menu');
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error', 'Failed to delete item');
    res.redirect('/admin/food-menu');
  }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await FoodMenu.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.available = !item.available;
    await item.save();

    res.json({ success: true, available: item.available });
  } catch (err) {
    console.error('Toggle error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};


const Inventory = require("../Models/inventory");

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort("item");
    res.render("admin/inventory", { items });
  } catch (err) {
    res.status(500).send("Error loading inventory");
  }
};

exports.addInventoryItem = async (req, res) => {
  const { item, quantity, minThreshold, supplier } = req.body;
  try {
    await Inventory.create({
      item,
      quantity: parseInt(quantity),
      minThreshold: parseInt(minThreshold),
      supplier,
      lastRestocked: new Date()
    });
    res.redirect("/admin/inventory");
  } catch (err) {
    res.status(500).send("Error adding item");
  }
};

exports.updateInventory = async (req, res) => {
  const { itemId, quantity } = req.body;
  try {
    await Inventory.findByIdAndUpdate(itemId, {
      quantity: parseInt(quantity),
      lastRestocked: new Date()
    });
    res.redirect("/admin/inventory");
  } catch (err) {
    res.status(500).send("Error updating inventory");
  }
};
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.get("/inventory", inventoryController.getInventory);
router.post("/inventory", inventoryController.addInventoryItem);
router.post("/inventory/update", inventoryController.updateInventory);

module.exports = router;
const express = require("express");
const router = express.Router();
const foodOrderController = require("../controllers/foodOrderController");

router.get("/menu", foodOrderController.getMenu);
router.post("/order", foodOrderController.placeOrder);

module.exports = router;

const express = require("express");
const router = express.Router();
const foodOrderController = require("../controllers/foodOrderController");

router.get("/menu", foodOrderController.getMenu);
router.post("/order", foodOrderController.placeOrder);
router.post("/cancel-order/:id", foodOrderController.cancelOrder);

module.exports = router;

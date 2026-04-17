const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/revenueController");

router.get("/", (req, res) => {
  res.render("admin");
});
router.get("/pricing", revenueController.getPricingRules);
router.post("/pricing", revenueController.addPricingRule);
router.get("/reports", revenueController.getRevenueReport);

module.exports = router;
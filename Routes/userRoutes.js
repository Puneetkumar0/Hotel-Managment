const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", (req, res) => res.render("index"));
router.get("/register", userController.getRegister);
router.post("/register", userController.postRegister);
router.get("/login", userController.getLogin);
router.post("/login", userController.postLogin);
router.get("/dashboard", userController.getDashboard); // Redirect to booking dashboard
router.get("/logout", userController.logout);
router.get("/support", userController.getSupport);
router.post("/support", userController.postSupport);

module.exports = router;
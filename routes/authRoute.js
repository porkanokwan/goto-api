const express = require("express");
const router = express.Router();
const authUser = require("../controllers/authController");

router.post("/login", authUser.login);
router.post("/register", authUser.register);
router.patch("/forgot-password", authUser.forgotPassword);
router.patch("/reset-password", authUser.resetPassword);

module.exports = router;

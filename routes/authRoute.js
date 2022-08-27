const express = require("express");
const router = express.Router();
const authUser = require("../controllers/authController");

router.post("/login", authUser.login);
router.post("/register", authUser.register);

module.exports = router;

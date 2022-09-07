const express = require("express");
const { getCategory, getProvince } = require("../controllers/selectController");

const router = express.Router();

router.get("/category", getCategory);
router.get("/province", getProvince);

module.exports = router;

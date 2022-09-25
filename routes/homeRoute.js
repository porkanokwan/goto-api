const express = require("express");
const router = express.Router();
const {
  home,
  searchByCategoryAndProvince,
  searchByCategory,
  searchByProvince,
} = require("../controllers/homeController");

router.get("/", home);
router.get("/category/province", searchByCategoryAndProvince);
router.get("/category", searchByCategory);
router.get("/province", searchByProvince);

module.exports = router;

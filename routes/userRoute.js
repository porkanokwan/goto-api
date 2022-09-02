const express = require("express");
const {
  home,
  searchByCategoryAndProvince,
  searchByCategory,
  searchByProvince,
} = require("../controllers/homeController");
const { getAllBlog, getBlogById } = require("../controllers/blogController");
const { getPlaceById } = require("../controllers/placeController");
const { getMenuByPlaceId } = require("../controllers/menuController");
const router = express.Router();

router.get("", home);
router.get("/category/province", searchByCategoryAndProvince);
router.get("/category", searchByCategory);
router.get("/province", searchByProvince);

router.get("/allplace", searchByCategory);
router.get("/allplace/province", searchByCategoryAndProvince);

router.get("/place/:placeId", getPlaceById);
router.get("/menu/:placeId", getMenuByPlaceId);
router.get("/blog", getAllBlog);
router.get("/blog/:blogId", getBlogById);

module.exports = router;

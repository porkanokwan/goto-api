const express = require("express");
const {
  home,
  searchByCategoryIdAndProvinceId,
  searchByCategoryId,
  searchByProvinceId,
  viewAllPlaceByCategory,
  viewAllPlaceByCategoryAndProvince,
  getPlaceById,
  getMenuByPlaceId,
  getAllBlog,
  getBlogById,
} = require("../controllers/userController");
const router = express.Router();

router.get("", home);
router.get(
  "/category/:categoryId/province/:provinceId",
  searchByCategoryIdAndProvinceId
);
router.get("/category/:categoryId", searchByCategoryId);
router.get("/province/:provinceId", searchByProvinceId);
router.get("/allplace/:categoryId", viewAllPlaceByCategory);
router.get(
  "/allplace/:categoryId/:provinceId",
  viewAllPlaceByCategoryAndProvince
);
router.get("/place/:placeId", getPlaceById);
router.get("/menu/:placeId", getMenuByPlaceId);
router.get("/blog", getAllBlog);
router.get("/blog/:blogId", getBlogById);

module.exports = router;

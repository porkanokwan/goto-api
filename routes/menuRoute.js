const express = require("express");
const upload = require("../middlewares/uploadImage");
const {
  getMenuByPlaceId,
  createMenu,
  updateMenu,
  deleteMenu,
} = require("../controllers/menuController");
const router = express.Router();

router.get("/:placeId", getMenuByPlaceId);
router.post("/:placeId", upload.single("menu_pic"), createMenu);
router.patch("/:menuId/place/:placeId", upload.single("menu_pic"), updateMenu);
router.delete("/:menuId/place/:placeId", deleteMenu);

module.exports = router;

const express = require("express");
const {
  createPlace,
  getPlaceById,
  updatePlace,
  deletePlace,
} = require("../controllers/placeController");
const upload = require("../middlewares/uploadImage");
const router = express.Router();

router.get("/:placeId", getPlaceById);
router.post(
  "/",
  upload.fields([{ name: "picture", maxCount: 5 }]),
  createPlace
);
router.patch(
  "/:placeId",
  upload.fields([{ name: "picture", maxCount: 5 }]),
  updatePlace
);
router.delete("/:placeId", deletePlace);

module.exports = router;

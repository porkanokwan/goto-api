const express = require("express");
const {
  createPlace,
  getPlaceById,
  updatePlace,
  deletePlace,
} = require("../controllers/placeController");
const upload = require("../middlewares/uploadImage");
const authenticateMiddleware = require("../middlewares/authenticate");
const router = express.Router();

router.get("/:placeId", getPlaceById);
router.post(
  "/",
  authenticateMiddleware,
  upload.fields([{ name: "picture", maxCount: 5 }]),
  createPlace
);
router.patch(
  "/:placeId",
  authenticateMiddleware,
  upload.fields([{ name: "picture", maxCount: 5 }]),
  updatePlace
);
router.delete("/:placeId", authenticateMiddleware, deletePlace);

module.exports = router;

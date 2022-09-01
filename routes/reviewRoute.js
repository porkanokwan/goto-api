const express = require("express");
const upload = require("../middlewares/uploadImage");
const {
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const router = express.Router();

router.post(
  "/:placeId",
  upload.fields([{ name: "review_pic", maxCount: 5 }]),
  createReview
);
router.patch(
  "/:reviewId/place/:placeId",
  upload.fields([{ name: "review_pic", maxCount: 5 }]),
  updateReview
);
router.delete("/:reviewId/place/:placeId", deleteReview);

module.exports = router;

const express = require("express");
const {
  getProfile,
  getProfileById,
  updateProfile,
  changePassword,
  getBlogUser,
} = require("../controllers/profileController");
const upload = require("../middlewares/uploadImage");
const router = express.Router();

router.get("/", getProfile);
router.get("/:userId", getProfileById);
router.get("/:userId/blog", getBlogUser);
router.patch("/", upload.single("profile_pic"), updateProfile);
router.patch("/changePassword", changePassword);

module.exports = router;

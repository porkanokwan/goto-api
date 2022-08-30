const express = require("express");
const {
  getAllBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  createLike,
  deleteLike,
} = require("../controllers/blogController");
const upload = require("../middlewares/uploadImage");
const router = express.Router();

router.get("/", getAllBlog);
router.get("/:blogId", getBlogById);
router.post(
  "/",
  upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "picture", maxCount: 20 },
  ]),
  createBlog
);
router.patch(
  "/:blogId",
  upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "picture", maxCount: 20 },
  ]),
  updateBlog
);
router.delete("/:blogId", deleteBlog);

router.post("/:blogId/like", createLike);
router.delete("/:blogId/like", deleteLike);

module.exports = router;

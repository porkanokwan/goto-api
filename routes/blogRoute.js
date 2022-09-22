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
const authenticateMiddleware = require("../middlewares/authenticate");
const router = express.Router();

router.get("/", getAllBlog);
router.get("/:blogId", getBlogById);
router.post(
  "/",
  authenticateMiddleware,
  upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "picture", maxCount: 20 },
  ]),
  createBlog
);
router.patch(
  "/:blogId",
  authenticateMiddleware,
  upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "picture", maxCount: 20 },
  ]),
  updateBlog
);
router.delete("/:blogId", authenticateMiddleware, deleteBlog);

router.post("/:blogId/like", authenticateMiddleware, createLike);
router.delete("/:blogId/like", authenticateMiddleware, deleteLike);

module.exports = router;

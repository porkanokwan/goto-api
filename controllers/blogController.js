const {
  Blog,
  PlaceInBlog,
  Province,
  Category,
  User,
  Like,
  sequelize,
} = require("../models");
const createError = require("../utils/createError");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

exports.getAllBlog = async (req, res, next) => {
  try {
    const allBlog = await Blog.findAll({
      attributes: { exclude: ["province_id", "category_id", "user_id"] },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: User,
          attributes: ["id", "name", "profile_pic"],
        },
        {
          model: PlaceInBlog,
          attributes: { exclude: ["blog_id"] },
        },
        {
          model: Like,
        },
      ],
    });

    res.status(200).json({ allBlog });
  } catch (err) {
    next(err);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({
      where: { id: blogId },
      attributes: {
        exclude: ["province_id", "category_id", "user_id"],
      },
      include: [
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: User,
          attributes: ["id", "name", "profile_pic"],
        },
        {
          model: PlaceInBlog,
          attributes: { exclude: ["blog_id"] },
        },
        {
          model: Like,
        },
      ],
    });
    if (!blog) {
      createError("This Blog not found on server", 400);
    }

    res.status(200).json({ blog });
  } catch (err) {
    next(err);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, provinceId, categoryId, content, place, titleShow } =
      req.body;
    if (!title) {
      createError("title is require", 400);
    }
    if (!provinceId) {
      createError("province is require", 400);
    }
    if (!categoryId) {
      createError("category is require", 400);
    }
    if (place.length < 1) {
      createError("places in this blog is require", 400);
    }
    if (!req.files.cover_pic || !req.files.picture) {
      createError("cover picture and picture is require", 400);
    }
    let coverPic;
    if (req.files.cover_pic) {
      const result = await cloudinary.upload(req.files.cover_pic[0].path);
      coverPic = result.secure_url;
    }

    const blog = await Blog.create({
      title,
      province_id: provinceId,
      category_id: categoryId,
      content,
      coverPic: coverPic,
      titleShow,
      user_id: req.member.id,
    });

    const places = JSON.parse(place);

    for (let idx = 0; idx < places.length; idx++) {
      let picture;
      if (req.files.picture) {
        const result = await cloudinary.upload(req.files.picture[idx].path);
        picture = result.secure_url;
      }

      await PlaceInBlog.create({
        name: places[idx].name,
        content: places[idx].content,
        picture,
        blog_id: blog.id,
      });
    }

    res.status(201).json({ message: "success" });
  } catch (err) {
    next(err);
  } finally {
    if (req.files.cover_pic) {
      fs.unlinkSync(req.files.cover_pic[0].path);
    }
    if (req.files.picture) {
      for (let idx = 0; idx < req.files.picture?.length; idx++) {
        fs.unlinkSync(req.files.picture[idx].path);
      }
    }
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const {
      title,
      provinceId,
      categoryId,
      content,
      cover_pic,
      picture,
      place,
      titleShow,
    } = req.body;
    const existBlog = await Blog.findOne({ where: { id: blogId } });
    const existPlaceBlog = await PlaceInBlog.findAll({
      where: { blog_id: blogId },
    });
    if (!existBlog) {
      createError("Blog not found on server", 400);
    }
    if (existBlog.user_id !== req.member.id) {
      createError("You have no permission", 403);
    }
    if (!title) {
      createError("title is require", 400);
    }
    if (!provinceId) {
      createError("province is require", 400);
    }
    if (!categoryId) {
      createError("category is require", 400);
    }
    if (!cover_pic && !req.files.cover_pic) {
      createError("cover picture is require", 400);
    }
    if (!picture?.length && !req.files.picture) {
      createError("picture is require", 400);
    }
    let coverPic;
    if (req.files.cover_pic) {
      if (existBlog.coverPic) {
        const splited = existBlog.coverPic.split("/");
        const publicId = splited[splited.length - 1].split(".")[0];
        await cloudinary.destroy(publicId);
      }
      const result = await cloudinary.upload(req.files.cover_pic[0].path);
      coverPic = result.secure_url;
    }
    await Blog.update(
      {
        title,
        provinceId,
        categoryId,
        content,
        coverPic: coverPic || cover_pic,
        titleShow,
      },
      { where: { id: blogId } }
    );

    const objPlaceBlog = JSON.parse(JSON.stringify(existPlaceBlog, null, 2));
    const objPlace = JSON.parse(place, null, 2);
    const lengthIdx =
      objPlaceBlog.length <= objPlace.length
        ? objPlace.length
        : objPlaceBlog.length;
    let i = 0;
    for (let idx = 0; idx < lengthIdx; idx++) {
      const pic =
        typeof picture === "string"
          ? picture
          : typeof picture === "undefined"
          ? undefined
          : picture[idx];

      if (req.files?.picture) {
        if (objPlaceBlog[idx]?.picture === pic && pic !== undefined) {
          if (
            !(
              objPlaceBlog[idx]?.name === objPlace[idx].name &&
              objPlaceBlog[idx]?.content === objPlace[idx].content
            )
          ) {
            await PlaceInBlog.update(
              {
                name: objPlace[idx].name,
                content: objPlace[idx].content,
              },
              { where: { id: objPlaceBlog[idx].id } }
            );
          }
        } else {
          if (objPlaceBlog[idx]?.picture) {
            const splited = existPlaceBlog[idx].picture.split("/");
            const publicId = splited[splited.length - 1].split(".")[0];
            await cloudinary.destroy(publicId);
          }
          if (typeof objPlace[idx].picture === "object") {
            const result = await cloudinary.upload(req.files.picture[i].path);
            i += 1;
            if (objPlace[idx]) {
              if (objPlaceBlog[idx]?.id) {
                await PlaceInBlog.update(
                  {
                    name: objPlace[idx].name,
                    content: objPlace[idx].content,
                    picture: result.secure_url,
                  },
                  { where: { id: objPlaceBlog[idx].id } }
                );
              } else {
                await PlaceInBlog.create({
                  name: objPlace[idx].name,
                  content: objPlace[idx].content,
                  picture: result.secure_url,
                  blog_id: blogId,
                });
              }
            } else {
              await PlaceInBlog.destroy({
                where: { id: objPlaceBlog[idx].id },
              });
            }
          }
        }
      } else if (picture) {
        if (objPlaceBlog[idx]?.picture === pic) {
          await PlaceInBlog.update(
            {
              name: objPlace[idx].name,
              content: objPlace[idx].content,
            },
            { where: { id: objPlaceBlog[idx].id } }
          );
        } else {
          if (objPlaceBlog[idx]?.picture) {
            const splited = objPlaceBlog[idx].picture.split("/");
            const publicId = splited[splited.length - 1].split(".")[0];
            await cloudinary.destroy(publicId);

            if (objPlace[idx]) {
              await PlaceInBlog.update(
                {
                  name: objPlace[idx].name,
                  content: objPlace[idx].content,
                  picture: picture[idx],
                },
                { where: { id: objPlaceBlog[idx].id } }
              );
            } else {
              await PlaceInBlog.destroy({
                where: { id: objPlaceBlog[idx].id },
              });
            }
          }
        }
      }
    }

    res.status(200).json({ message: "update success" });
  } catch (err) {
    next(err);
  } finally {
    if (req.files.cover_pic) {
      fs.unlinkSync(req.files.cover_pic[0].path);
    }
    if (req.files.picture) {
      for (let idx = 0; idx < req.files.picture?.length; idx++) {
        fs.unlinkSync(req.files.picture[idx].path);
      }
    }
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ where: { id: blogId } });
    if (!blog) {
      createError("This Blog is not found on server", 400);
    }
    if (blog.user_id !== req.member.id) {
      createError("you have no permission", 403);
    }
    if (blog.coverPic) {
      const splited = blog.coverPic.split("/");
      const publicId = splited[splited.length - 1].split(".")[0];
      await cloudinary.destroy(publicId);
    }

    await PlaceInBlog.destroy({ where: { blog_id: blogId } });
    await Like.destroy({ where: { blog_id: blogId, user_id: req.member.id } });
    await blog.destroy();

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

exports.createLike = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { blogId } = req.params;
    const existLike = await Like.findOne({
      where: { blog_id: blogId, user_id: req.member.id },
    });
    if (existLike) {
      createError("You already like tihs blog", 400);
    }

    const blog = await Blog.findOne({ where: { id: blogId } });
    if (!blog) {
      createError("This Blog is not found on server", 400);
    }

    const like = await Like.create(
      { blog_id: blogId, user_id: req.member.id },
      { transaction: t }
    );
    await blog.increment({ like: 1 }, { silent: true, transaction: t });
    await t.commit();

    res.status(200).json({ like });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.deleteLike = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { blogId } = req.params;
    const like = await Like.findOne({
      where: { blog_id: blogId, user_id: req.member.id },
    });
    if (!like) {
      createError("You never like this blog", 400);
    }
    const blog = await Blog.findOne({ where: { id: blogId } });
    if (!blog) {
      createError("This Blog is not found on server", 400);
    }

    await Like.destroy({ where: { id: like.id } }, { transaction: t });
    await blog.decrement({ like: 1 }, { silent: true, transaction: t });
    await t.commit();
    res.status(204).json();
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

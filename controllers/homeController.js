const { Place, Category, Province, User, PlacePic } = require("../models");
const createError = require("../utils/createError");

exports.home = async (req, res, next) => {
  try {
    const place = await Place.findAll({
      attributes: { exclude: ["category_id", "province_id", "user_id"] },
      order: [
        ["star", "DESC"],
        ["updatedAt", "DESC"],
      ],
      include: [
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        { model: User, attributes: ["id", "name", "profilePic"] },
        {
          model: PlacePic,
          attributes: {
            exclude: ["createdAt", "updatedAt", "blog_id", "user_id"],
          },
        },
      ],
    });
    const obj = JSON.parse(JSON.stringify(place, null, 2));
    const allplace = obj.reduce((acc, item) => {
      acc[item.Category.name]
        ? (acc[item.Category.name] = [...acc[item.Category.name], { ...item }])
        : (acc[item.Category.name] = [{ ...item }]);

      return acc;
    }, {});

    res.status(200).json({ allplace });
  } catch (err) {
    next(err);
  }
};

exports.searchByCategoryAndProvince = async (req, res, next) => {
  try {
    const { category, province } = req.query;
    const allplace = await Place.findAll({
      where: { category_id: category, province_id: province },
      attributes: { exclude: ["category_id", "province_id", "user_id"] },
      order: [
        ["star", "DESC"],
        ["updatedAt", "DESC"],
      ],
      include: [
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        { model: User, attributes: ["id", "name", "profilePic"] },
        {
          model: PlacePic,
          attributes: {
            exclude: ["createdAt", "updatedAt", "blog_id", "user_id"],
          },
        },
      ],
    });

    res.status(200).json({ allplace });
  } catch (err) {
    next(err);
  }
};

exports.searchByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const allplace = await Place.findAll({
      where: { category_id: category },
      attributes: { exclude: ["category_id", "province_id", "user_id"] },
      order: [
        ["star", "DESC"],
        ["updatedAt", "DESC"],
      ],
      include: [
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        { model: User, attributes: ["id", "name", "profilePic"] },
        {
          model: PlacePic,
          attributes: {
            exclude: ["createdAt", "updatedAt", "blog_id", "user_id"],
          },
        },
      ],
    });

    if (allplace.length === 0) {
      createError("Don't have any place in this category", 400);
    }

    res.status(200).json({ allplace });
  } catch (err) {
    next(err);
  }
};

exports.searchByProvince = async (req, res, next) => {
  try {
    const { province } = req.query;
    const place = await Place.findAll({
      where: { province_id: province },
      attributes: { exclude: ["category_id", "province_id", "user_id"] },
      order: [
        ["star", "DESC"],
        ["updatedAt", "DESC"],
      ],
      include: [
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Province,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        { model: User, attributes: ["id", "name", "profilePic"] },
        {
          model: PlacePic,
          attributes: {
            exclude: ["createdAt", "updatedAt", "blog_id", "user_id"],
          },
        },
      ],
    });

    if (place.length === 0) {
      createError("Don't have any place in this province", 400);
    }

    const obj = JSON.parse(JSON.stringify(place, null, 2));
    const allplace = obj.reduce((acc, item) => {
      acc[item.Category.name]
        ? (acc[item.Category.name] = [...acc[item.Category.name], { ...item }])
        : (acc[item.Category.name] = [{ ...item }]);

      return acc;
    }, {});

    res.status(200).json({ allplace });
  } catch (err) {
    next(err);
  }
};

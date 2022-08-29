const {
  PlacePic,
  Place,
  Province,
  Category,
  Review,
  ReviewPic,
} = require("../models");
const cloudinary = require("../utils/cloudinary");
const createError = require("../utils/createError");
const fs = require("fs");

exports.createPlace = async (req, res, next) => {
  try {
    const {
      name,
      provinceId,
      categoryId,
      address,
      recommendRoute,
      adultPrice,
      childPrice,
      ratePrice,
      condition,
      day,
      openClose,
      wifi,
      parking,
      reserve,
      phoneNumber,
      website,
      other,
    } = req.body;

    const hasPlace = await Place.findOne({
      where: { name, province_id: provinceId, category_id: categoryId },
    });
    if (hasPlace) {
      createError("This place already has in this server", 400);
    }
    if (!name) {
      createError("name is require", 400);
    }
    if (!provinceId) {
      createError("province is require", 400);
    }
    if (!categoryId) {
      createError("category is require", 400);
    }
    if (!address) {
      createError("address is require", 400);
    }
    const place = await Place.create({
      name,
      address,
      adultPrice,
      recommendRoute,
      childPrice,
      ratePrice,
      condition,
      day,
      openClose,
      wifi,
      parking,
      reserve,
      phoneNumber,
      website,
      other,
      province_id: provinceId,
      category_id: categoryId,
      user_id: req.member.id,
    });

    if (Object.keys(req.files).length === 0) {
      createError("picture is require", 400);
    }
    if (req.files.picture.length > 5) {
      createError("You can upload only 5 photos", 400);
    }

    let results = [];
    if (req.files.picture) {
      for (let i = 0; i < req.files.picture.length; i++) {
        const result = await cloudinary.upload(req.files.picture[i].path);
        results.push(result.secure_url);
      }
    }

    for (let i = 0; i < req.files.picture.length; i++) {
      await PlacePic.create({
        picture: results[i],
        user_id: req.member.id,
        place_id: place.id,
      });
    }

    const placeWithPic = await Place.findOne({
      where: { id: place.id },
      attributes: { exclude: ["userId"] },
      include: {
        model: PlacePic,
        attributes: { exclude: ["userId", "placeId"] },
      },
    });

    res.status(201).json({ place: placeWithPic });
  } catch (err) {
    next(err);
  } finally {
    if (req.files) {
      for (let i = 0; i < req.files.picture.length; i++) {
        fs.unlinkSync(req.files.picture[i].path);
      }
    }
  }
};

exports.getPlaceById = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const place = await Place.findOne({
      where: { id: placeId },
      attributes: { exclude: ["userId"] },
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
          model: PlacePic,
          attributes: { exclude: ["placeId", "createdAt", "updatedAt"] },
        },
        {
          model: Review,
          attributes: { exclude: ["placeId"] },
          include: {
            model: ReviewPic,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        },
      ],
    });

    if (!place) {
      createError("This place is not found", 400);
    }

    res.status(200).json({ place });
  } catch (err) {
    next(err);
  }
};

exports.updatePlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const {
      name,
      provinceId,
      categoryId,
      address,
      recommendRoute,
      adultPrice,
      childPrice,
      ratePrice,
      condition,
      day,
      openClose,
      wifi,
      parking,
      reserve,
      phoneNumber,
      website,
      other,
    } = req.body;
    const place = await Place.findOne({ where: { id: placeId } });
    const placePic = await PlacePic.findAll({ where: { place_id: placeId } });
    if (!place) {
      createError("This place is not found", 400);
    }
    if (!placePic) {
      createError("Picture of this place is not found", 400);
    }
    if (!name) {
      createError("name is require", 400);
    }
    if (!provinceId) {
      createError("province is require", 400);
    }
    if (!categoryId) {
      createError("category is require", 400);
    }
    if (!address) {
      createError("address is require", 400);
    }
    if (Object.keys(req.files).length === 0) {
      createError("pictures is require", 400);
    }
    if (req.files.picture.length > 5) {
      createError("You can upload only 5 photos", 400);
    }
    const lengthIdx =
      req.files.picture.length >= placePic.length
        ? req.files.picture.length
        : placePic.length;
    for (let idx = 0; idx < lengthIdx; idx++) {
      if (req.files?.picture[idx]) {
        const result = await cloudinary.upload(req.files.picture[idx].path);
        if (placePic[idx]?.picture) {
          const splited = placePic[idx].picture.split("/");
          const publicId = splited[splited.length - 1].split(".")[0];
          await cloudinary.destroy(publicId);
        }
        placePic[idx]?.id
          ? await PlacePic.update(
              { picture: result.secure_url },
              { where: { id: placePic[idx].id } }
            )
          : await PlacePic.create({
              picture: result.secure_url,
              place_id: placeId,
              user_id: req.member.id,
            });
      } else {
        if (placePic[idx]?.picture) {
          const splited = placePic[idx].picture.split("/");
          const publicId = splited[splited.length - 1].split(".")[0];
          await cloudinary.destroy(publicId);
        }
        await PlacePic.destroy({ where: { id: placePic[idx].id } });
      }
    }

    await Place.update(
      {
        name,
        address,
        adultPrice,
        recommendRoute,
        childPrice,
        ratePrice,
        condition,
        day,
        openClose,
        wifi,
        parking,
        reserve,
        phoneNumber,
        website,
        other,
        province_id: provinceId,
        category_id: categoryId,
      },
      { where: { id: placeId } }
    );

    const placeUpdate = await Place.findOne({
      where: { id: placeId },
      attributes: { exclude: ["userId"] },
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
          model: PlacePic,
          attributes: { exclude: ["placeId", "createdAt", "updatedAt"] },
        },
        {
          model: Review,
          attributes: { exclude: ["placeId"] },
          include: {
            model: ReviewPic,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        },
      ],
    });
    res.status(200).json({ place: placeUpdate });
  } catch (err) {
    next(err);
  } finally {
    for (let idx = 0; idx < req.files.picture.length; idx++) {
      fs.unlinkSync(req.files.picture[idx].path);
    }
  }
};

exports.deletePlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const place = await Place.findOne({ where: { id: placeId } });
    const placePic = await PlacePic.findAll({ where: { place_id: placeId } });
    if (!place) {
      createError("This place is not found", 400);
    }
    if (req.member.id !== place.user_id) {
      createError("You have no permission", 403);
    }
    if (placePic.picture) {
      for (let idx = 0; idx < placePic.picture.length; idx++) {
        const splited = placePic[idx].picture.split("/");
        const publicId = splited[splited.length - 1].split(".")[0];
        await cloudinary.destroy(publicId);
      }
    }

    await PlacePic.destroy({ where: { place_id: placeId } });
    await place.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

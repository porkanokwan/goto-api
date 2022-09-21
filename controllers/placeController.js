const {
  PlacePic,
  Place,
  Province,
  Category,
  Review,
  ReviewPic,
  User,
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
    if (req.files?.picture) {
      for (let i = 0; i < req.files.picture.length; i++) {
        const result = await cloudinary.upload(req.files.picture[i].path);
        results.push(result.secure_url);
      }
    }

    for (let i = 0; i < req.files.picture?.length; i++) {
      await PlacePic.create({
        picture: results[i],
        user_id: req.member.id,
        place_id: place.id,
      });
    }

    const placeWithPic = await Place.findOne({
      where: { id: place.id },
      attributes: { exclude: ["userId"] },
      include: [
        {
          model: PlacePic,
          attributes: { exclude: ["userId", "placeId"] },
        },
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });

    res.status(201).json({ place: placeWithPic });
  } catch (err) {
    next(err);
  } finally {
    if (req.files?.picture) {
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
      attributes: { exclude: ["user_id", "province_id", "category_id"] },
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
          attributes: {
            exclude: ["place_id", "user_id", "createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: { exclude: ["place_id", "user_id"] },
          separate: true,
          order: [["updatedAt", "DESC"]],
          include: [
            {
              model: ReviewPic,
              attributes: { exclude: ["review_id", "createdAt", "updatedAt"] },
            },
            { model: User, attributes: ["id", "name", "profilePic"] },
          ],
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
      picture,
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
    if (Object.keys(req.files).length === 0 && !picture) {
      createError("pictures is require", 400);
    }
    if (req.files.picture?.length > 5) {
      createError("You can upload only 5 photos", 400);
    }
    const objPlacePic = JSON.parse(JSON.stringify(placePic, null, 2));
    const picLength =
      picture && req.files.picture
        ? typeof picture === "string"
          ? 1 + req.files.picture.length
          : typeof picture === "object"
          ? picture.length + req.files.picture.length
          : req.files.picture.length
        : typeof picture === "undefined"
        ? req.files.picture.length
        : typeof picture === "string"
        ? 1
        : picture.length;

    const lengthIdx =
      objPlacePic.length <= picLength ? picLength : objPlacePic.length;

    let i = 0;
    for (let idx = 0; idx < lengthIdx; idx++) {
      const pic =
        typeof picture === "string"
          ? picture
          : typeof picture === "undefined"
          ? undefined
          : picture[idx];

      if (req.files?.picture) {
        if (
          objPlacePic[idx]?.picture !== pic &&
          objPlacePic[idx]?.picture !== undefined
        ) {
          if (req.files.picture[i]) {
            const result = await cloudinary.upload(req.files.picture[i].path);
            if (objPlacePic[idx]?.picture) {
              const splited = objPlacePic[idx].picture.split("/");
              const publicId = splited[splited.length - 1].split(".")[0];
              await cloudinary.destroy(publicId);

              if (objPlacePic[idx]?.id) {
                await PlacePic.update(
                  {
                    picture: result.secure_url,
                    place_id: placeId,
                  },
                  { where: { id: objPlacePic[idx].id } }
                );
              } else {
                await PlacePic.create({
                  picture: result.secure_url,
                  place_id: placeId,
                  user_id: req.member.id,
                });
              }
              i += 1;
            }
          }
        } else {
          if (!objPlacePic[idx]?.id) {
            const result = await cloudinary.upload(req.files.picture[i].path);
            await PlacePic.create({
              picture: result.secure_url,
              place_id: placeId,
              user_id: req.member.id,
            });

            i += 1;
          }
        }
      } else if (picture) {
        if (objPlacePic[idx].picture !== pic) {
          const splited = objPlacePic[idx].picture.split("/");
          const publicId = splited[splited.length - 1].split(".")[0];
          await cloudinary.destroy(publicId);

          if (pic === undefined || pic === picture) {
            await PlacePic.destroy({ where: { id: objPlacePic[idx].id } });
          } else {
            await PlacePic.update(
              {
                picture: pic,
              },
              { where: { id: objPlacePic[idx].id } }
            );
          }
        }
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
      attributes: { exclude: ["user_id"] },
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
          attributes: { exclude: ["place_id", "createdAt", "updatedAt"] },
        },
      ],
    });
    res.status(200).json({ place: placeUpdate });
  } catch (err) {
    next(err);
  } finally {
    if (req.files?.picture) {
      for (let idx = 0; idx < req.files.picture.length; idx++) {
        fs.unlinkSync(req.files.picture[idx].path);
      }
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

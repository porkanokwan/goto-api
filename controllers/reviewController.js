const { Place, Review, ReviewPic, User, sequelize } = require("../models");
const createError = require("../utils/createError");
const cloudinary = require("../utils/cloudinary");
const { Op } = require("sequelize");
const fs = require("fs");

exports.createReview = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { placeId } = req.params;
    const { title, review, star } = req.body;
    const place = await Place.findOne({ where: { id: placeId } });
    if (!place) {
      createError("This place is not found on server", 400);
    }
    if (!title) {
      createError("title is require", 400);
    }
    if (!review) {
      createError("review is require", 400);
    }
    if (!star) {
      createError("score is require", 400);
    }
    const newReview = await Review.create({
      title,
      review,
      star,
      place_id: placeId,
      user_id: req.member.id,
    });
    if (req.files.review_pic) {
      for (let idx = 0; idx < req.files.review_pic.length; idx++) {
        const result = await cloudinary.upload(req.files.review_pic[idx].path);
        await ReviewPic.create({
          reviewPic: result.secure_url,
          review_id: newReview.id,
        });
      }
    }
    const amountFive = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 5 } },
    });
    const amountFour = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 4 } },
    });
    const amountThree = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 3 } },
    });
    const amountTwo = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 2 } },
    });
    const amountOne = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 1 } },
    });
    const amount = await Review.count({ where: { place_id: placeId } });
    const reviewStar =
      (5 * amountFive +
        4 * amountFour +
        3 * amountThree +
        2 * amountTwo +
        1 * amountOne) /
        amount -
      place.star;

    await place.increment(
      { star: reviewStar },
      { silent: true, transaction: t }
    );

    const reviewWithPic = await Review.findAll({
      where: { place_id: placeId },
      attributes: { exclude: ["user_id"] },
      order: [["updatedAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name", "profile_pic"] },
        {
          model: ReviewPic,
          require: true,
          attributes: { exclude: ["review_id"] },
        },
      ],
    });
    await t.commit();
    res.status(200).json({ review: reviewWithPic });
  } catch (err) {
    await t.rollback();
    next(err);
  } finally {
    for (let idx = 0; idx < req.files.review_pic?.length; idx++) {
      fs.unlinkSync(req.files.review_pic[idx].path);
    }
  }
};

exports.updateReview = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { reviewId, placeId } = req.params;
    const { title, review, star } = req.body;
    const place = await Place.findOne({ where: { id: placeId } });
    const reviewPic = await ReviewPic.findAll({
      where: { review_id: reviewId },
    });
    if (!place) {
      createError("This place is not found on server", 400);
    }
    if (!title) {
      createError("title is require", 400);
    }
    if (!review) {
      createError("review is require", 400);
    }
    if (!star) {
      createError("score is require", 400);
    }
    await Review.update(
      {
        title,
        review,
        star,
        place_id: placeId,
        user_id: req.member.id,
      },
      { where: { id: reviewId } }
    );

    const lengthIdx =
      reviewPic.length <= req.files.review_pic?.length
        ? req.files.review_pic.length
        : reviewPic.length;

    for (let idx = 0; idx < lengthIdx; idx++) {
      if (req.files?.review_pic && req.files?.review_pic[idx]) {
        if (reviewPic[idx]?.reviewPic) {
          const splited = reviewPic[idx].reviewPic.split("/");
          const publicId = splited[splited.length - 1].split(".")[0];
          await cloudinary.destroy(publicId);
        }

        const result = await cloudinary.upload(req.files.review_pic[idx].path);
        if (reviewPic[idx]?.id) {
          if (req.files.review_pic[idx]) {
            await ReviewPic.update(
              {
                reviewPic: result.secure_url,
                review_id: reviewId,
              },
              { where: { id: reviewPic[idx].id } }
            );
          }
        } else {
          await ReviewPic.create({
            reviewPic: result.secure_url,
            review_id: reviewId,
          });
        }
      } else {
        if (reviewPic[idx]?.reviewPic) {
          const splited = reviewPic[idx].reviewPic.split("/");
          const publicId = splited[splited.length - 1].split(".")[0];
          console.log(publicId);
          await cloudinary.destroy(publicId);
        }
        await ReviewPic.destroy({ where: { id: reviewPic[idx].id } });
      }
    }

    const amountFive = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 5 } },
    });
    const amountFour = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 4 } },
    });
    const amountThree = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 3 } },
    });
    const amountTwo = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 2 } },
    });
    const amountOne = await Review.count({
      where: { place_id: placeId, star: { [Op.eq]: 1 } },
    });
    const amount = await Review.count({ where: { place_id: placeId } });
    const reviewStar =
      (5 * amountFive +
        4 * amountFour +
        3 * amountThree +
        2 * amountTwo +
        1 * amountOne) /
        amount -
      place.star;

    await place.increment(
      { star: reviewStar },
      { silent: true, transaction: t }
    );

    const reviewWithPic = await Review.findAll({
      where: { place_id: placeId },
      attributes: { exclude: ["user_id"] },
      order: [["updatedAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name", "profile_pic"] },
        {
          model: ReviewPic,
          require: true,
          attributes: { exclude: ["review_id"] },
        },
      ],
    });
    await t.commit();
    res.status(200).json({ review: reviewWithPic });
  } catch (err) {
    await t.rollback();
    next(err);
  } finally {
    if (req.files.review_pic?.length) {
      for (let idx = 0; idx < req.files.review_pic?.length; idx++) {
        fs.unlinkSync(req.files.review_pic[idx].path);
      }
    }
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId, placeId } = req.params;
    const existReview = await Review.findOne({
      where: { id: reviewId, place_id: placeId },
    });
    const reviewPic = await ReviewPic.findAll({
      where: { review_id: reviewId },
    });
    if (!existReview) {
      createError("This review is not found on this place", 400);
    }
    if (existReview.user_id !== req.member.id) {
      createError("you have no permission", 403);
    }
    if (reviewPic.length) {
      for (let idx = 0; idx < reviewPic.length; idx++) {
        const splited = reviewPic[idx].reviewPic.split("/");
        const publicId = splited[splited.length - 1].split(".")[0];
        await cloudinary.destroy(publicId);

        await ReviewPic.destroy({ where: { id: reviewPic[idx].id } });
      }
    }

    await Review.destroy({ where: { id: existReview.id } });

    res.status(204).json();
  } catch (err) {
    next(err);
  } finally {
  }
};

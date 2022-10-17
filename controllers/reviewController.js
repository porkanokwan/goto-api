const { Place, Review, ReviewPic, User } = require("../models");
const createError = require("../utils/createError");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const { calculateScore } = require("../service/scoreService");

exports.createReview = async (req, res, next) => {
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
    calculateScore(place, next);

    const reviewWithPic = await Review.findOne({
      where: { id: newReview.id },
      attributes: { exclude: ["user_id"] },
      include: [
        { model: User, attributes: ["id", "name", "profile_pic"] },
        {
          model: ReviewPic,
          require: true,
          attributes: { exclude: ["review_id"] },
        },
      ],
    });
    res.status(200).json({ review: reviewWithPic });
  } catch (err) {
    next(err);
  } finally {
    for (let idx = 0; idx < req.files.review_pic?.length; idx++) {
      fs.unlinkSync(req.files.review_pic[idx].path);
    }
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId, placeId } = req.params;
    const { title, review, star, review_pic } = req.body;
    const existReview = await Review.findOne({ where: { id: reviewId } });
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
    if (existReview.user_id !== req.member.id) {
      createError("you have no permission", 403);
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
    if (req.files.review_pic) {
      const objReviewPic = JSON.parse(JSON.stringify(reviewPic, null, 2));
      const picLength =
        review_pic && req.files.review_pic
          ? typeof review_pic === "string"
            ? 1 + req.files.review_pic.length
            : typeof review_pic === "object"
            ? review_pic.length + req.files.review_pic.length
            : req.files.review_pic.length
          : typeof review_pic === "undefined"
          ? req.files.review_pic.length
          : typeof review_pic === "string"
          ? 1
          : review_pic.length;

      const lengthIdx =
        objReviewPic.length <= picLength ? picLength : objReviewPic.length;

      let i = 0;
      for (let idx = 0; idx < lengthIdx; idx++) {
        const pic =
          typeof review_pic === "string"
            ? review_pic
            : typeof review_pic === "undefined"
            ? undefined
            : review_pic[idx];

        if (req.files?.review_pic) {
          if (
            objReviewPic[idx]?.reviewPic !== pic &&
            objReviewPic[idx]?.reviewPic !== undefined
          ) {
            if (req.files.review_pic[i]) {
              const result = await cloudinary.upload(
                req.files.review_pic[i].path
              );
              if (objReviewPic[idx]?.reviewPic) {
                const splited = objReviewPic[idx].reviewPic.split("/");
                const publicId = splited[splited.length - 1].split(".")[0];
                await cloudinary.destroy(publicId);

                await ReviewPic.update(
                  {
                    reviewPic: result.secure_url,
                    review_id: reviewId,
                  },
                  { where: { id: objReviewPic[idx].id } }
                );

                i += 1;
              }
            }
          } else {
            if (!objReviewPic[idx]?.id) {
              const result = await cloudinary.upload(
                req.files.review_pic[i].path
              );
              await ReviewPic.create({
                reviewPic: result.secure_url,
                review_id: reviewId,
              });

              i += 1;
            }
          }
        } else if (review_pic) {
          if (objReviewPic[idx].reviewPic !== pic) {
            const splited = reviewPic[idx].reviewPic.split("/");
            const publicId = splited[splited.length - 1].split(".")[0];
            await cloudinary.destroy(publicId);

            if (pic === undefined || pic === review_pic) {
              await ReviewPic.destroy({ where: { id: reviewPic[idx].id } });
            } else {
              await ReviewPic.update(
                {
                  reviewPic: pic,
                },
                { where: { id: reviewPic[idx].id } }
              );
            }
          }
        }
      }
    }
    calculateScore(place, next);

    const reviewWithPic = await Review.findOne({
      where: { id: reviewId },
      attributes: { exclude: ["user_id"] },
      include: [
        { model: User, attributes: ["id", "name", "profile_pic"] },
        {
          model: ReviewPic,
          require: true,
          attributes: { exclude: ["review_id"] },
        },
      ],
    });

    res.status(200).json({ review: reviewWithPic });
  } catch (err) {
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
    const place = await Place.findOne({ where: { id: placeId } });
    const existReview = await Review.findOne({
      where: { id: reviewId, place_id: placeId },
    });
    const reviewPic = await ReviewPic.findAll({
      where: { review_id: reviewId },
    });
    if (!place) {
      createError("This place is not found on server", 400);
    }
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

    calculateScore(place, next);

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

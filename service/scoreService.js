const { Review, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.calculateScore = async (place, next) => {
  const t = await sequelize.transaction();
  try {
    const amountFive = await Review.count({
      where: { place_id: place.id, star: { [Op.eq]: 5 } },
    });
    const amountFour = await Review.count({
      where: { place_id: place.id, star: { [Op.eq]: 4 } },
    });
    const amountThree = await Review.count({
      where: { place_id: place.id, star: { [Op.eq]: 3 } },
    });
    const amountTwo = await Review.count({
      where: { place_id: place.id, star: { [Op.eq]: 2 } },
    });
    const amountOne = await Review.count({
      where: { place_id: place.id, star: { [Op.eq]: 1 } },
    });
    const amount = await Review.count({ where: { place_id: place.id } });
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

    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

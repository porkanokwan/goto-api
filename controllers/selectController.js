const { Category, Province } = require("../models");

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findAll();
    res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

exports.getProvince = async (req, res, next) => {
  try {
    const province = await Province.findAll();
    res.status(200).json({ province });
  } catch (err) {
    next(err);
  }
};

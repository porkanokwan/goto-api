const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      createError("Unauthenticate", 401);
    }

    const token = authorization.split("Bearer ")[1];
    if (!token) {
      createError("Unauthenticate", 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRETKEY);
    const user = await User.findOne({
      where: { id: payload.id },
      attributes: { exclude: ["password"] },
    });

    req.member = user;
    next();
  } catch (err) {
    next(err);
  }
};

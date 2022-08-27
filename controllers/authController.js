const { Op } = require("sequelize");
const { User } = require("../models");
const createError = require("../utils/createError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const createToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRETKEY, {
    expiresIn: "7d",
  });
  return token;
};

exports.register = async (req, res, next) => {
  try {
    const { name, emailorPhone, password, confirmPassword } = req.body;

    if (!name) {
      createError("name is required", 400);
    }
    if (!emailorPhone) {
      createError("email or phone is required", 400);
    }
    if (!password) {
      createError("password is required", 400);
    }
    if (password !== confirmPassword) {
      createError("password is not match", 400);
    }

    let letter = [];
    let number = [];
    for (let character of password) {
      if (validator.isAlpha(character)) {
        letter.push(validator.isUppercase(character));
      }
      if (validator.isNumeric(character)) {
        number.push(character);
      }
    }

    const isCorrectPassword = letter.includes(true) && number.length !== 0;
    if (!isCorrectPassword) {
      createError(
        "Must have at least 8 characters, contains 1 capital letter, lower case letter and number",
        400
      );
    }

    const isEmail = validator.isEmail(emailorPhone);
    const isMobilePhone = validator.isMobilePhone(emailorPhone);
    if (!(isEmail || isMobilePhone)) {
      createError("email or phoneNumber is invalid format", 400);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: isEmail ? emailorPhone : null,
      phoneNumber: isMobilePhone ? emailorPhone : null,
      password: hashed,
    });

    const token = createToken({ id: user.id });

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailorPhone, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailorPhone }, { phoneNumber: emailorPhone }],
      },
    });
    if (!user) {
      createError("Invalid credential", 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createError("password incorrect", 400);
    }

    const token = createToken({ id: user.id });

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

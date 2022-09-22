const {
  User,
  Blog,
  PlaceInBlog,
  Province,
  Category,
  Like,
} = require("../models");
const createError = require("../utils/createError");
const validator = require("validator");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.member.id },
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      createError("This account is not found on server", 400);
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.getProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      createError("This account is not found on server", 400);
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, aboutMe } = req.body;
    const user = await User.findOne({
      where: { id: req.member.id },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      createError("This account is not found on server", 400);
    }
    if (user.id !== req.member.id) {
      createError("you have no permission", 403);
    }
    if (!name) {
      createError("name is require", 400);
    }
    if (!(email || phoneNumber)) {
      createError("email or phoneNumber is require", 400);
    }

    const isEmail =
      email !== "" && email !== null ? validator.isEmail(email) : "email";
    const isMobilePhone =
      phoneNumber !== null && phoneNumber !== ""
        ? validator.isMobilePhone(phoneNumber)
        : "phoneNumber";
    if (!(isEmail && isMobilePhone)) {
      createError("email or phoneNumber invalid format", 400);
    }

    let profilePic;
    if (req.file) {
      if (user.profilePic) {
        const spilted = user.profilePic.split("/");
        const publicId = spilted[spilted.length - 1].split(".")[0];
        await cloudinary.destroy(publicId);
      }
      const result = await cloudinary.upload(req.file.path);
      profilePic = result.secure_url;
    }

    await User.update(
      {
        name,
        email: isEmail !== "email" ? email : null,
        phoneNumber: isMobilePhone ? phoneNumber : null,
        aboutMe,
        profilePic,
      },
      { where: { id: req.member.id } }
    );

    const updateUser = await User.findOne({ where: { id: user.id } });
    res.status(200).json({ user: updateUser });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ where: { id: req.member.id } });
    if (!oldPassword) {
      createError("password is require", 400);
    }
    if (!newPassword) {
      createError("new password is require", 400);
    }
    if (!confirmPassword) {
      createError("confirm password is require", 400);
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      createError("wrong password", 400);
    }
    let letter = [];
    let number = [];
    for (let character of newPassword) {
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
    if (newPassword !== confirmPassword) {
      createError("password is not match", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: req.member.id } }
    );

    res.status(200).json({ message: "update password success" });
  } catch (err) {
    next(err);
  }
};

exports.getBlogUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const allBlog = await Blog.findAll({
      where: { user_id: userId },
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

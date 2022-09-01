const { Op } = require("sequelize");
const { User } = require("../models");
const createError = require("../utils/createError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sendMail = require("../service/sendEmailService");

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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      createError("Invalid credential", 400);
    }
    const token = createToken({ id: user.id });
    const data = {
      from: `Goto Web Contact <${process.env.URL_MAIL}>`,
      to: email,
      subject: "กำหนดรหัสผ่านของคุณใหม่",
      html: `<h2>สวัสดี ${user.name}</h2> 
          <p>เราได้รับคำขอเพื่อตั้งค่ารหัสผ่านใหม่ สำหรับสมาชิกที่ใช้อีเมลล์ ${email}</p> 
          <p>กรุณาคลิกที่นี่ ${process.env.URL_RESET}/auth/reset-password?token=${token}</p>
          `,
    };
    sendMail(data);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPasssword } = req.body;
    const { token } = req.query;
    if (!newPassword) {
      createError("password is required", 400);
    }
    if (newPassword !== confirmPasssword) {
      createError("password is not match", 400);
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

    const payload = jwt.verify(token, process.env.JWT_SECRETKEY);

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashed }, { where: { id: payload.id } });
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

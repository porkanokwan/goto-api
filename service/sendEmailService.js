const nodemailer = require("nodemailer");

module.exports = async (data) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.URL_MAIL,
        pass: process.env.GOOGLE_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail(data);
  } catch (err) {
    next(err);
  }
};

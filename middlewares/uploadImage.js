const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "." + file.mimetype.split("/")[1]);
  },
});

module.exports = multer({ storage: storage });

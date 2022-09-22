require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const errorMiddleware = require("./middlewares/error");
const notFoundMiddleware = require("./middlewares/notFound");
const authenticateMiddleware = require("./middlewares/authenticate");

const authRoute = require("./routes/authRoute");
const selectRoute = require("./routes/selectRoute");
const homeRoute = require("./routes/homeRoute");
const placeRoute = require("./routes/placeRoute");
const profileRoute = require("./routes/profileRoute");
const blogRoute = require("./routes/blogRoute");
const reviewRoute = require("./routes/reviewRoute");
const menuRoute = require("./routes/menuRoute");

const { addProvince } = require("./service/provinceService");
const { addCategory } = require("./service/categoryService");

const app = express();

// const { sequelize } = require("./models");
// sequelize.sync({ force: true });
// addProvince();
// addCategory(
//   path.join(__dirname, "/public/img/attraction.jpg"),
//   path.join(__dirname, "/public/img/restaurant.jpg"),
//   path.join(__dirname, "/public/img/streetFood.jpg"),
//   path.join(__dirname, "/public/img/nightLife.jpg")
// );

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/", homeRoute);
app.use("/select", selectRoute);
app.use("/auth", authRoute);
app.use("/profile", authenticateMiddleware, profileRoute);
app.use("/place", placeRoute);
app.use("/blog", blogRoute);
app.use("/review", authenticateMiddleware, reviewRoute);
app.use("/menu", authenticateMiddleware, menuRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log("Server run on port " + port));

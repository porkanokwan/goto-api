require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { error } = require("./middlewares/error");
const { notFound } = require("./middlewares/notFound");
const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { sequelize } = require("./models");
sequelize.sync({ force: true });

app.use(notFound);
app.use(error);

app.listen(process.env.PORT, () => console.log("Server run on port 8005"));

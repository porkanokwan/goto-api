const cloudinary = require("../utils/cloudinary");
const { Category } = require("../models");
const createError = require("../utils/createError");

exports.addCategory = async (
  attractionFile,
  restaurantFile,
  streetFoodFile,
  nightLifeFile
) => {
  try {
    const attractionLink = await cloudinary.upload(attractionFile);
    const restaurantLink = await cloudinary.upload(restaurantFile);
    const streetFoodLink = await cloudinary.upload(streetFoodFile);
    const nightLifeLink = await cloudinary.upload(nightLifeFile);
    console.log(attractionLink);

    const categories = await Category.bulkCreate([
      { name: "Attractions", coverPic: attractionLink.secure_url },
      { name: "Restaurant & Cafe", coverPic: restaurantLink.secure_url },
      { name: "Street Food", coverPic: streetFoodLink.secure_url },
      { name: "NightLife", coverPic: nightLifeLink.secure_url },
    ]);
  } catch (err) {
    // console.log(err);
    createError("Invalid credential", 400);
  }
};

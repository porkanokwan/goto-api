const cloudinary = require("cloudinary").v2;
const { Category } = require("../models");
const createError = require("../utils/createError");

exports.addCategory = async (
  attractionFile,
  restaurantFile,
  streetFoodFile,
  nightLifeFile
) => {
  try {
    const attractionLink = await cloudinary.uploader.upload(
      attractionFile,
      (error, result) => {
        if (error) {
          return console.log(error);
        }
        return result.secure_url;
      }
    );
    const restaurantLink = await cloudinary.uploader.upload(
      restaurantFile,
      (error, result) => {
        if (error) {
          return console.log(error);
        }
        return result.secure_url;
      }
    );
    const streetFoodLink = await cloudinary.uploader.upload(
      streetFoodFile,
      (error, result) => {
        if (error) {
          return console.log(error);
        }
        return result.secure_url;
      }
    );
    const nightLifeLink = await cloudinary.uploader.upload(
      nightLifeFile,
      (error, result) => {
        if (error) {
          return console.log(error);
        }
        return result.secure_url;
      }
    );

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

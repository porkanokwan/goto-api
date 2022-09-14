const { Place, PlaceMenu, Menu, User } = require("../models");
const createError = require("../utils/createError");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

exports.getMenuByPlaceId = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const placeMenu = await Place.findOne({
      where: { id: placeId },
      attributes: ["id", "name"],
      include: [
        { model: Menu, include: { model: User, attributes: ["id", "name"] } },
      ],
    });
    res.status(201).json({ placeMenu });
  } catch (err) {
    next(err);
  }
};

exports.createMenu = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { title } = req.body;
    const place = await Place.findOne({ where: { id: placeId } });
    const user = await User.findOne({ where: { id: req.member.id } });
    if (!place) {
      createError("This place is not found on server", 400);
    }
    if (!user) {
      createError("This account is not found on server, please login", 400);
    }
    if (!(title && req.file)) {
      createError("title and picture is require", 400);
    }
    let menuPic;
    if (req.file) {
      const result = await cloudinary.upload(req.file.path);
      menuPic = result.secure_url;
    }
    const menu = await Menu.create({ title, menuPic });
    await place.addMenu(menu);
    await user.addMenu(menu);

    const newMenu = await Menu.findOne({
      where: { id: menu.id },
      include: { model: User, attributes: ["id", "name"] },
    });
    console.log(newMenu);
    res.status(201).json({ newMenu });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.updateMenu = async (req, res, next) => {
  try {
    const { menuId, placeId } = req.params;
    const { title, menu_pic } = req.body;
    const place = await Place.findOne({ where: { id: placeId } });
    const menu = await Menu.findOne({
      where: { id: menuId },
      include: { model: User, attributes: ["id", "name"] },
    });
    const placeMenu = await PlaceMenu.findOne({
      where: { menu_id: menuId, place_id: placeId },
    });
    const user = await User.findOne({ where: { id: req.member.id } });
    console.log(title);
    if (!place) {
      createError("This place is not found on server", 400);
    }
    if (!placeMenu) {
      createError("This menu is not found in place", 400);
    }
    if (!user) {
      createError("This account is not found on server, please login", 400);
    }
    if (menu.Users[0].id !== req.member.id) {
      createError("you have no permission", 403);
    }
    if (!(title && (menu_pic || req.file))) {
      createError("title and picture is require", 400);
    }

    let menuPic;
    if (req.file) {
      if (menu.menuPic) {
        const splited = menu.menuPic.split("/");
        const publicId = splited[splited.length - 1].split(".")[0];
        await cloudinary.destroy(publicId);
      }
      const result = await cloudinary.upload(req.file.path);
      menuPic = result.secure_url;
    }

    await Menu.update({ title, menuPic }, { where: { id: menuId } });
    const newMenu = await Menu.findOne({
      where: { id: menuId },
      include: { model: User, attributes: ["id", "name"] },
    });

    res.status(200).json({ menu: newMenu });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.deleteMenu = async (req, res, next) => {
  try {
    const { menuId, placeId } = req.params;
    const place = await Place.findOne({ where: { id: placeId } });
    const menu = await Menu.findOne({
      where: { id: menuId },
      include: { model: User, attributes: ["id", "name"] },
    });
    const placeMenu = await PlaceMenu.findOne({
      where: { menu_id: menuId, place_id: placeId },
    });
    const user = await User.findOne({ where: { id: req.member.id } });
    if (!place) {
      createError("This place is not found on server", 400);
    }
    if (!placeMenu) {
      createError("This menu is not found in place", 400);
    }
    if (!user) {
      createError("This account is not found on server, please login", 400);
    }
    if (menu.Users[0].id !== req.member.id) {
      createError("you have no permission", 403);
    }
    if (menu.menuPic) {
      const splited = menu.menuPic.split("/");
      const publicId = splited[splited.length - 1].split(".")[0];
      await cloudinary.destroy(publicId);
    }

    await menu.destroy();

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

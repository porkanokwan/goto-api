const PlaceMenu = require("./PlaceMenu");
const UserMenu = require("./UserMenu");

module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define(
    "Menu",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      menuPic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { underscored: true }
  );

  Menu.associate = (model) => {
    Menu.belongsToMany(model.User, {
      through: model.UserMenu,
      foreignKey: "menu_id",
    });

    Menu.belongsToMany(model.Place, {
      through: model.PlaceMenu,
      foreignKey: "menu_id",
    });
  };

  return Menu;
};

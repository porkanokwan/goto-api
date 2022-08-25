module.exports = (sequelize, DataTypes) => {
  const PlaceMenu = sequelize.define(
    "PlaceMenu",
    {
      placeMenuId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    { underscored: true }
  );

  return PlaceMenu;
};

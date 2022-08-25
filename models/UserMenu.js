module.exports = (sequelize, DataTypes) => {
  const UserMenu = sequelize.define(
    "UserMenu",
    {
      userMenuId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    { underscored: true }
  );

  return UserMenu;
};

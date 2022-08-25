module.exports = (sequelize, DataTypes) => {
  const PlacePic = sequelize.define(
    "PlacePic",
    {
      picture: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

  PlacePic.associate = (model) => {
    PlacePic.belongsTo(model.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    PlacePic.belongsTo(model.Place, {
      foreignKey: {
        name: "place_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return PlacePic;
};

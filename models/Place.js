const PlaceMenu = require("./PlaceMenu");

module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define(
    "Place",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      star: {
        type: DataTypes.DECIMAL(2, 1).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      wifi: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      parking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      reserve: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ratePrice: DataTypes.STRING,
      adultPrice: DataTypes.INTEGER,
      childPrice: DataTypes.INTEGER,
      condition: DataTypes.STRING,
      address: DataTypes.STRING,
      recommendRoute: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      website: DataTypes.STRING,
      day: DataTypes.STRING,
      openClose: DataTypes.STRING,
      other: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  );

  Place.associate = (model) => {
    Place.belongsTo(model.Province, {
      foreignKey: {
        name: "province_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Place.belongsTo(model.Category, {
      foreignKey: {
        name: "category_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Place.belongsTo(model.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Place.hasMany(model.Review, {
      foreignKey: {
        name: "place_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Place.hasMany(model.PlacePic, {
      foreignKey: {
        name: "place_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Place.belongsToMany(model.Menu, {
      through: model.PlaceMenu,
      foreignKey: "place_id",
    });
  };

  return Place;
};

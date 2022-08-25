module.exports = (sequelize, DataTypes) => {
  const Province = sequelize.define(
    "Province",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      underscored: true,
    }
  );

  Province.associate = (model) => {
    Province.hasMany(model.Place, {
      foreignKey: {
        name: "province_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Province.hasMany(model.Blog, {
      foreignKey: {
        name: "province_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return Province;
};

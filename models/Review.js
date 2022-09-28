module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      review: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      star: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      underscored: true,
    }
  );

  Review.associate = (model) => {
    Review.belongsTo(model.User, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Review.belongsTo(model.Place, {
      foreignKey: {
        name: "place_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });

    Review.hasMany(model.ReviewPic, {
      foreignKey: {
        name: "review_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return Review;
};

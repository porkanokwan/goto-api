module.exports = (sequelize, Datatypes) => {
  const ReviewPic = sequelize.define(
    "ReviewPic",
    {
      reviewPic: Datatypes.STRING,
    },
    {
      underscored: true,
    }
  );

  ReviewPic.associate = (model) => {
    ReviewPic.belongsTo(model.Review, {
      foreignKey: {
        name: "review_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return ReviewPic;
};

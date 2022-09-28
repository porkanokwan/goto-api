module.exports = (sequelize, DataTypes) => {
  const PlaceInBlog = sequelize.define(
    "PlaceInBlog",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

  PlaceInBlog.associate = (model) => {
    PlaceInBlog.belongsTo(model.Blog, {
      foreignKey: {
        name: "blog_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return PlaceInBlog;
};

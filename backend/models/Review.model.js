const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imdbID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dateLogged: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: () => `MOVIE WATCHED ON ${new Date().toISOString()}`,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likedBy: {
      type: DataTypes.JSONB,
      defaultValue: [],
      // Structure: [{ username: string, profilePicture: string }]
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    indexes: [
      {
        fields: ["username"],
      },
      {
        fields: ["imdbID"],
      },
      {
        fields: ["email"],
      },
    ],
  }
);

module.exports = Review;

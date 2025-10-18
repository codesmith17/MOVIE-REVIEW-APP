const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dislikes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    replies: {
      type: DataTypes.JSONB,
      defaultValue: [],
      // Structure: [{ reply: string, username: string, profilePicture: string, likes: number, likedBy: string[] }]
    },
    likedBy: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    dislikedBy: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    indexes: [
      {
        fields: ["reviewID"],
      },
    ],
  }
);

module.exports = Comment;

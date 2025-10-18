const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      defaultValue: "https://wallpapercave.com/wp/wp12696718.jpg",
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    followers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    following: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    followersList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    followingList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    resetToken: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = User;

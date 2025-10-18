const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const List = sequelize.define(
  "List",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "normal",
    },
    content: {
      type: DataTypes.JSONB,
      defaultValue: [],
      // Structure: [{ id: string, posterLink: string, title: string }]
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ownerUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "lists",
    timestamps: true,
    indexes: [
      {
        fields: ["ownerUsername"],
      },
    ],
  }
);

module.exports = List;

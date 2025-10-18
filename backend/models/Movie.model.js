const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    imdbID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    emails: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "movies",
    timestamps: true,
  }
);

module.exports = Movie;

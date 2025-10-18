const { sequelize } = require("../config/database");
const User = require("./User.model");
const Review = require("./Review.model");
const Movie = require("./Movie.model");
const List = require("./List.model");
const Comment = require("./Comment.model");

// Define associations here if needed in the future
// Example: User.hasMany(Review, { foreignKey: 'email', sourceKey: 'email' });

const models = {
  User,
  Review,
  Movie,
  List,
  Comment,
  sequelize,
};

module.exports = models;

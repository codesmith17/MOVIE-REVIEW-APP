const mongoose = require("mongoose");
const likedSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
});
const reviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  imdbID: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: false,
  },
  dateLogged: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: false,
    default: `MOVIE WATCHED ON ${new Date().toISOString()}`,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  username: {
    type: String,
    required: true,
  },
  likedBy: [likedSchema],
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

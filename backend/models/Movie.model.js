const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },

  emails: [
    {
      type: String,
    },
  ],
});
const Movies = mongoose.model("Movies", movieSchema);

module.exports = Movies;

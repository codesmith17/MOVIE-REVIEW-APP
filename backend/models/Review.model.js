const mongoose = require("mongoose");

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
        default: 0
    },


});



const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
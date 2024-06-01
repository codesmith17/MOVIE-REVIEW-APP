const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "https://wallpapercave.com/wp/wp12696718.jpg",
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    followers: {
        type: Number,
        required: true,
        default: 0
    },
    following: {
        type: Number,
        required: true,
        default: 0
    },
    followersList: [{
        type: String,
    }],
    followingList: [{
        type: String,
    }],
    resetToken: {
        type: String,
        default: null
    }

});

const User = mongoose.model("User", userSchema);

module.exports = User;
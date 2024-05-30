const { response } = require("express");
const Comment = require("../models/Comment.model.js");
const postComment = (req, res, next) => {
    // console.log(":)", req.body)
    const { reviewID, username, comment, profilePicture, time } = req.body;
    Comment.create({ reviewID, username, comment, profilePicture, time, likes: 0, dislikes: 0, replies: [], likedBy: [], dislikedBy: [] })
        .then(newComment => {
            res.status(201).json({ message: "User registered.", newComment });
            return;
        })
        .catch(err => {
            console.log(err);
            return;
        })
}
const getComments = (req, res, next) => {
    const reviewID = req.params.reviewID;
    Comment.find({ reviewID })
        .then(response => {
            if (response) {
                console.log(":3", response);
                if (response.length > 0) {
                    res.status(200).json({ message: "COMMENTS FETCHED", data: response })
                } else {
                    res.status(204).json({ message: "NO COMMENTS FOUND" })
                }
                return;
            }
        })
        .catch(err => {
            res.status(400).json({ message: "ERROR" });
            return;
        })
}
module.exports = { postComment, getComments }
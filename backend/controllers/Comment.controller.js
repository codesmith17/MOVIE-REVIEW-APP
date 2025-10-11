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


const replyLike = async(req, res, next) => {
    try {
        // const { } = req.params;
        const { username, commentId, replyIndex } = req.body;

        if (!commentId || replyIndex === undefined || !username) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (replyIndex >= comment.replies.length) {
            return res.status(404).json({ error: "Reply not found" });
        }

        const reply = comment.replies[replyIndex];
        const userLikedIndex = reply.likedBy.indexOf(username);

        if (userLikedIndex === -1) {
            // User hasn't liked the reply yet, so add the like
            reply.likedBy.push(username);
            reply.likes += 1;
        } else {
            // User already liked the reply, so remove the like
            reply.likedBy.splice(userLikedIndex, 1);
            reply.likes = Math.max(0, reply.likes - 1); // Ensure likes don't go below 0
        }

        await comment.save();

        res.status(200).json({
            message: userLikedIndex === -1 ? "Reply liked successfully" : "Reply unliked successfully",
            likes: reply.likes,
            likedBy: reply.likedBy
        });

    } catch (err) {
        console.error("Error in replyLike:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = replyLike;

const postLikeComment = (req, res, next) => {
    const likedBy = req.body.username;
    const commentID = req.body.commentID;
    // console.log("!@3123", likedBy)
    let flag = false;
    Comment.findOne({ _id: commentID })
        .then(comment => {
            if (comment) {
                if (comment.likedBy.includes(likedBy)) {
                    // User has already liked the comment, so we unlike it
                    comment.likedBy.pull(likedBy);
                    comment.likes--;
                    flag = false;
                } else {
                    flag = true;
                    if (comment.dislikedBy.includes(likedBy)) {
                        comment.dislikedBy.pull(likedBy);
                        comment.dislikes--;
                    }
                    comment.likedBy.push(likedBy);
                    comment.likes++;
                }

                comment.save()
                    .then(updatedComment => {
                        res.status(200).json({
                            message: 'Comment liked successfully' + flag,
                            likes: updatedComment.likes,
                        });
                    })
                    .catch(err => {
                        res.status(500).json({ message: 'Error updating comment', error: err });
                    });
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Error finding comment', error: err });
        });
};
const postDislikeComment = (req, res, next) => {
    const dislikedBy = req.body.username;
    const commentID = req.body.commentID;
    let flag = false;
    Comment.findOne({ _id: commentID })
        .then(comment => {
            if (comment) {
                console.log(comment);
                if (comment.dislikedBy.includes(dislikedBy)) {
                    // User has already liked the comment, so we unlike it
                    comment.dislikedBy.pull(dislikedBy);
                    comment.dislikes--;
                    flag = false;
                } else {
                    flag = true;
                    if (comment.likedBy.includes(dislikedBy)) {
                        comment.likedBy.pull(dislikedBy);
                        comment.likes--;
                    }
                    comment.dislikes++;
                    comment.dislikedBy.push(dislikedBy);

                }

                comment.save()
                    .then(updatedComment => {
                        res.status(200).json({
                            message: 'Comment disliked successfully' + flag,
                            dislikes: updatedComment.dislikes,
                        });
                    })
                    .catch(err => {
                        res.status(500).json({ message: 'Error updating comment', error: err });
                    });
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Error finding comment', error: err });
        });
}
const postReply = async(req, res, next) => {
    const { commentID, reply, username, profilePicture } = req.body;

    try {
        // Find the comment by ID
        const comment = await Comment.findById(commentID);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }


        const newReply = {
            reply,
            username,
            profilePicture,

        };

        // Add the new reply to the comment's replies array
        comment.replies.push(newReply);

        // Save the updated comment
        await comment.save();

        res.status(200).json({ message: "Reply posted successfully", reply: newReply });
    } catch (error) {
        console.error("Error posting reply:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const deleteComment = async (req, res, next) => {
    const { commentID } = req.params;
    const { reviewOwner } = req.body;
    const currentUser = req.user.username; // Assuming user info is in req.user from auth middleware

    try {
        // Check if user is authorized (review owner or admin "krishna")
        if (currentUser !== reviewOwner && currentUser !== "krishna") {
            return res.status(403).json({ message: "Unauthorized to delete this comment" });
        }

        const comment = await Comment.findById(commentID);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Mark comment as deleted and remove all replies
        comment.comment = "This comment was deleted by review owner or admin";
        comment.deleted = true;
        comment.replies = [];

        await comment.save();

        res.status(200).json({ message: "Comment deleted successfully", comment });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const deleteReply = async (req, res, next) => {
    const { commentID, replyIndex, reviewOwner } = req.body;
    const currentUser = req.user.username; // Assuming user info is in req.user from auth middleware

    try {
        // Check if user is authorized (review owner or admin "krishna")
        if (currentUser !== reviewOwner && currentUser !== "krishna") {
            return res.status(403).json({ message: "Unauthorized to delete this reply" });
        }

        const comment = await Comment.findById(commentID);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (replyIndex >= comment.replies.length || replyIndex < 0) {
            return res.status(404).json({ message: "Reply not found" });
        }

        // Remove the specific reply
        comment.replies.splice(replyIndex, 1);

        await comment.save();

        res.status(200).json({ message: "Reply deleted successfully", comment });
    } catch (error) {
        console.error("Error deleting reply:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { postComment, getComments, postLikeComment, postDislikeComment, postReply, replyLike, deleteComment, deleteReply }
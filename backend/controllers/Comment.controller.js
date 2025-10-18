const { response } = require("express");
const Comment = require("../models/Comment.model.js");

const postComment = async (req, res, next) => {
  const { reviewID, username, comment, profilePicture, time } = req.body;

  try {
    const newComment = await Comment.create({
      reviewID,
      username,
      comment,
      profilePicture,
      time,
      likes: 0,
      dislikes: 0,
      replies: [],
      likedBy: [],
      dislikedBy: [],
    });

    res.status(201).json({ message: "Comment posted.", newComment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error posting comment" });
  }
};

const getComments = async (req, res, next) => {
  const reviewID = req.params.reviewID;

  try {
    const response = await Comment.findAll({ where: { reviewID } });

    if (response && response.length > 0) {
      console.log(":3", response);
      res.status(200).json({ message: "COMMENTS FETCHED", data: response });
    } else {
      res.status(204).json({ message: "NO COMMENTS FOUND" });
    }
  } catch (err) {
    res.status(400).json({ message: "ERROR" });
  }
};

const replyLike = async (req, res, next) => {
  try {
    const { username, commentId, replyIndex } = req.body;

    if (!commentId || replyIndex === undefined || !username) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const replies = [...comment.replies];

    if (replyIndex >= replies.length) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const reply = replies[replyIndex];
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

    await Comment.update({ replies }, { where: { id: commentId } });

    res.status(200).json({
      message: userLikedIndex === -1 ? "Reply liked successfully" : "Reply unliked successfully",
      likes: reply.likes,
      likedBy: reply.likedBy,
    });
  } catch (err) {
    console.error("Error in replyLike:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const postLikeComment = async (req, res, next) => {
  const likedBy = req.body.username;
  const commentID = req.body.commentID;
  let flag = false;

  try {
    const comment = await Comment.findByPk(commentID);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let likedByArray = [...comment.likedBy];
    let dislikedByArray = [...comment.dislikedBy];
    let likes = comment.likes;
    let dislikes = comment.dislikes;

    if (likedByArray.includes(likedBy)) {
      // User has already liked the comment, so we unlike it
      likedByArray = likedByArray.filter((user) => user !== likedBy);
      likes--;
      flag = false;
    } else {
      flag = true;
      if (dislikedByArray.includes(likedBy)) {
        dislikedByArray = dislikedByArray.filter((user) => user !== likedBy);
        dislikes--;
      }
      likedByArray.push(likedBy);
      likes++;
    }

    await Comment.update(
      {
        likedBy: likedByArray,
        dislikedBy: dislikedByArray,
        likes,
        dislikes,
      },
      { where: { id: commentID } }
    );

    res.status(200).json({
      message: "Comment liked successfully" + flag,
      likes,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error finding comment", error: err });
  }
};

const postDislikeComment = async (req, res, next) => {
  const dislikedBy = req.body.username;
  const commentID = req.body.commentID;
  let flag = false;

  try {
    const comment = await Comment.findByPk(commentID);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let likedByArray = [...comment.likedBy];
    let dislikedByArray = [...comment.dislikedBy];
    let likes = comment.likes;
    let dislikes = comment.dislikes;

    console.log(comment);

    if (dislikedByArray.includes(dislikedBy)) {
      // User has already disliked the comment, so we un-dislike it
      dislikedByArray = dislikedByArray.filter((user) => user !== dislikedBy);
      dislikes--;
      flag = false;
    } else {
      flag = true;
      if (likedByArray.includes(dislikedBy)) {
        likedByArray = likedByArray.filter((user) => user !== dislikedBy);
        likes--;
      }
      dislikes++;
      dislikedByArray.push(dislikedBy);
    }

    await Comment.update(
      {
        likedBy: likedByArray,
        dislikedBy: dislikedByArray,
        likes,
        dislikes,
      },
      { where: { id: commentID } }
    );

    res.status(200).json({
      message: "Comment disliked successfully" + flag,
      dislikes,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error finding comment", error: err });
  }
};

const postReply = async (req, res, next) => {
  const { commentID, reply, username, profilePicture } = req.body;

  try {
    // Find the comment by ID
    const comment = await Comment.findByPk(commentID);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = {
      reply,
      username,
      profilePicture,
      likes: 0,
      likedBy: [],
    };

    // Add the new reply to the comment's replies array
    const updatedReplies = [...comment.replies, newReply];

    await Comment.update({ replies: updatedReplies }, { where: { id: commentID } });

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

    const comment = await Comment.findByPk(commentID);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Mark comment as deleted and remove all replies
    await Comment.update(
      {
        comment: "This comment was deleted by review owner or admin",
        deleted: true,
        replies: [],
      },
      { where: { id: commentID } }
    );

    const updatedComment = await Comment.findByPk(commentID);

    res.status(200).json({ message: "Comment deleted successfully", comment: updatedComment });
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

    const comment = await Comment.findByPk(commentID);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (replyIndex >= comment.replies.length || replyIndex < 0) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Remove the specific reply
    const updatedReplies = [...comment.replies];
    updatedReplies.splice(replyIndex, 1);

    await Comment.update({ replies: updatedReplies }, { where: { id: commentID } });

    const updatedComment = await Comment.findByPk(commentID);

    res.status(200).json({ message: "Reply deleted successfully", comment: updatedComment });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  postComment,
  getComments,
  postLikeComment,
  postDislikeComment,
  postReply,
  replyLike,
  deleteComment,
  deleteReply,
};

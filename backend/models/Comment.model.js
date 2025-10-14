const mongoose = require("mongoose");
const replySchema = new mongoose.Schema({
  reply: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  likedBy: [
    {
      type: String,
      required: true,
    },
  ],
});
const commentSchema = new mongoose.Schema({
  reviewID: {
    type: String,
    required: true,
  },

  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  dislikes: {
    type: Number,
    required: true,
    default: 0,
  },
  comment: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  replies: [replySchema],
  likedBy: [
    {
      type: String,
    },
  ],
  dislikedBy: [
    {
      type: String,
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
});
const Comments = mongoose.model("Comments", commentSchema);

module.exports = Comments;

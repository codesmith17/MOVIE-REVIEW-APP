const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  posterLink: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "normal",
  },
  content: [contentSchema],
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: false,
  },
  ownerUsername: {
    type: String,
    required: true,
  },
});

const Lists = mongoose.model("Lists", listSchema);

module.exports = Lists;

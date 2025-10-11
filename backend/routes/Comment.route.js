const express = require("express");
const router = express.Router();

const { postComment, getComments, postLikeComment, postDislikeComment, postReply, replyLike, deleteComment, deleteReply } = require("../controllers/Comment.controller.js");
const { verifyUser } = require("../controllers/Auth.controller.js");


router.post("/postComment", verifyUser, postComment);
router.get("/getCommentsByReviewId/:reviewID", getComments);
router.post("/likeComment", verifyUser, postLikeComment);
router.post("/dislikeComment", verifyUser, postDislikeComment);
router.post("/likeReply", verifyUser, replyLike);
router.post("/postReply", verifyUser, postReply);
router.delete("/deleteComment/:commentID", verifyUser, deleteComment);
router.delete("/deleteReply", verifyUser, deleteReply);

module.exports = router;
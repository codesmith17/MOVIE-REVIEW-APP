const express = require("express");
const router = express.Router();

const { postComment, getComments } = require("../controllers/Comment.controller.js");
const { verifyUser } = require("../controllers/Auth.controller.js");


router.post("/postComment", verifyUser, postComment);
router.get("/getCommentsByReviewId/:reviewID", getComments);
// router.get("/getOthersData", getOthersData);
// router.post('/google', google);
module.exports = router;
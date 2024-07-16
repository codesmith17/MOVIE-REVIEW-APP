const express = require("express");
const router = express.Router();

const { getList, addToList } = require("../controllers/List.controller.js");
const { verifyUser } = require("../controllers/Auth.controller.js");

router.get("/getList/:username/:type", getList);
router.post("/addToList/:type", verifyUser, addToList);
// router.post("/postComment", verifyUser, postComment);
// router.get("/getCommentsByReviewId/:reviewID", getComments);
// router.post("/likeComment", verifyUser, postLikeComment);
// router.post("/dislikeComment", verifyUser, postDislikeComment);
// router.get("/getOthersData", getOthersData);
// router.post('/google', google);

// router.post("/postReply", postReply)
module.exports = router;
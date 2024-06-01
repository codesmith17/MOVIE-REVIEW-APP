const express = require("express");
const router = express.Router();
const { postReview, getPersonalReview, getReviewById, getOtherReviews, postReviewLikes, deleteReview } = require("../controllers/Review.controller");
const { verifyUser } = require("../controllers/Auth.controller"); // Assuming your middleware is exported correctly

router.post("/postReview", verifyUser, postReview);
router.get("/getPersonalReview/:imdbID", verifyUser, getPersonalReview);
router.get("/getReviewById/:imdbID/:reviewID", getReviewById);
router.get("/getOtherReviews/:imdbID/:reviewID?", getOtherReviews);
router.post("/postReviewLikes", verifyUser, postReviewLikes);
router.delete("/deleteReview/:reviewID", verifyUser, deleteReview);
module.exports = router;
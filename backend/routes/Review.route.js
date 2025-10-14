const express = require("express");
const router = express.Router();
const {
  postReview,
  updateRating,
  getPersonalReview,
  getReviewById,
  getOtherReviews,
  postReviewLikes,
  deleteReview,
  editReview,
  getReviews,
  upsertRating,
  getRating,
  getLikedReviews,
} = require("../controllers/Review.controller");
const { verifyUser } = require("../controllers/Auth.controller");

router.post("/postReview", verifyUser, postReview);
router.get("/getPersonalReview/:imdbID", verifyUser, getPersonalReview);
router.get("/getReviewById/:imdbID/:reviewID", getReviewById);
router.get("/getOtherReviews/:imdbID/:reviewID?", getOtherReviews);
router.post("/postReviewLikes", verifyUser, postReviewLikes);
router.delete("/deleteReview/:reviewID", verifyUser, deleteReview);
router.put("/updateReview/:reviewID", verifyUser, editReview);
router.get("/getReviews/:username", getReviews);
router.get("/getLikedReviews/:username", getLikedReviews);
router.put("/updateRating/:reviewID", verifyUser, updateRating);
router.post("/upsertRating", verifyUser, upsertRating);
router.get("/getRating", verifyUser, getRating);
module.exports = router;

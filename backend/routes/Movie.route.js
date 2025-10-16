const express = require("express");
const router = express.Router();

const { verifyUser, optionalAuth } = require("../controllers/Auth.controller.js");
const {
  postLikes,
  getLikes,
  getRecommendations,
  getTrending,
  scrapeIMDb,
  getLikedMoviesCount,
} = require("../controllers/Movie.controller.js");

router.post("/postLikes", verifyUser, postLikes);
router.get("/getLikes/:imdbID/:source?", optionalAuth, getLikes);
router.get("/getRecos/:imdbID/:title/:year", getRecommendations);
router.get("/getTrending", getTrending);
router.get("/getImdb/:imdbID", scrapeIMDb);
router.get("/getLikedMoviesCount/:username", getLikedMoviesCount);
// router.post('/google', google);
module.exports = router;

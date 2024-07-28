const express = require("express");
const router = express.Router();

const { verifyUser } = require("../controllers/Auth.controller.js");
const { postLikes, getLikes, getRecommendations, getTrending, scrapeIMDb } = require("../controllers/Movie.controller.js");


router.post("/postLikes", verifyUser, postLikes);
router.get("/getLikes/:imdbID/:source?", verifyUser, getLikes);
router.get("/getRecos/:imdbID/:title/:year", getRecommendations);
router.get("/getTrending", getTrending);
router.get("/getImdb/:imdbID", scrapeIMDb)
    // router.post('/google', google);
module.exports = router;
/**
 * TMDB Routes
 * Proxy routes for TMDB API calls
 */

const express = require("express");
const router = express.Router();
const tmdbController = require("../controllers/Tmdb.controller");

// Search routes (must come before parameterized routes)
router.get("/search/movie", tmdbController.searchMovie);
router.get("/search/multi", tmdbController.searchMulti);

// Find by IMDB ID
router.get("/find/:imdbId", tmdbController.findByImdbId);

// Trending
router.get("/trending/:mediaType/:timeWindow", tmdbController.getTrending);

// Movie lists
router.get("/movie/:category", tmdbController.getMovieList);

// TV lists
router.get("/tv/:category", tmdbController.getTVList);

// Person details
router.get("/person/:id", tmdbController.getPersonDetails);

// Media details and related endpoints
router.get("/:mediaType/:id/credits", tmdbController.getCredits);
router.get("/:mediaType/:id/videos", tmdbController.getVideos);
router.get("/:mediaType/:id/providers", tmdbController.getWatchProviders);
router.get("/:mediaType/:id/recommendations", tmdbController.getRecommendations);
router.get("/:mediaType/:id", tmdbController.getDetails);

module.exports = router;

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

// Region-based content (Trending Near You)
router.get("/region/movies", tmdbController.getRegionalMovies);
router.get("/region/tv", tmdbController.getRegionalTV);
router.get("/region/now-playing", tmdbController.getNowPlayingRegional);

// Trending
router.get("/trending/:mediaType/:timeWindow", tmdbController.getTrending);

// Movie lists - SPECIFIC routes before generic :id
router.get("/movie/now_playing", tmdbController.getMovieList);
router.get("/movie/popular", tmdbController.getMovieList);
router.get("/movie/upcoming", tmdbController.getMovieList);
router.get("/movie/top_rated", tmdbController.getMovieList);

// TV lists - SPECIFIC routes before generic :id
router.get("/tv/popular", tmdbController.getTVList);
router.get("/tv/on_the_air", tmdbController.getTVList);
router.get("/tv/top_rated", tmdbController.getTVList);
router.get("/tv/airing_today", tmdbController.getTVList);

// Person details
router.get("/person/:id", tmdbController.getPersonDetails);

// Media details and related endpoints (MUST come AFTER specific routes)
router.get("/:mediaType/:id/credits", tmdbController.getCredits);
router.get("/:mediaType/:id/videos", tmdbController.getVideos);
router.get("/:mediaType/:id/providers", tmdbController.getWatchProviders);
router.get("/:mediaType/:id/recommendations", tmdbController.getRecommendations);
router.get("/:mediaType/:id", tmdbController.getDetails);

module.exports = router;

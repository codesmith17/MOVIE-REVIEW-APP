/**
 * TMDB Controller
 * Handles all TMDB proxy API requests
 */

const tmdbService = require("../services/TmdbService");

/**
 * Get movie or TV show details
 * GET /api/tmdb/:mediaType/:id
 */
const getDetails = async (req, res) => {
  try {
    const { mediaType, id } = req.params;
    const data = await tmdbService.getDetails(mediaType, id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get credits (cast & crew)
 * GET /api/tmdb/:mediaType/:id/credits
 */
const getCredits = async (req, res) => {
  try {
    const { mediaType, id } = req.params;
    const data = await tmdbService.getCredits(mediaType, id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get videos (trailers)
 * GET /api/tmdb/:mediaType/:id/videos
 */
const getVideos = async (req, res) => {
  try {
    const { mediaType, id } = req.params;
    const data = await tmdbService.getVideos(mediaType, id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get watch providers
 * GET /api/tmdb/:mediaType/:id/providers
 */
const getWatchProviders = async (req, res) => {
  try {
    const { mediaType, id } = req.params;
    const data = await tmdbService.getWatchProviders(mediaType, id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get recommendations
 * GET /api/tmdb/:mediaType/:id/recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    const { mediaType, id } = req.params;
    const { page = 1 } = req.query;
    const data = await tmdbService.getRecommendations(mediaType, id, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search movies
 * GET /api/tmdb/search/movie?query=...
 */
const searchMovie = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    const data = await tmdbService.searchMovie(query, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search multi (movies, TV, people)
 * GET /api/tmdb/search/multi?query=...
 */
const searchMulti = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    const data = await tmdbService.searchMulti(query, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Find by IMDB ID
 * GET /api/tmdb/find/:imdbId
 */
const findByImdbId = async (req, res) => {
  try {
    const { imdbId } = req.params;
    const data = await tmdbService.findByImdbId(imdbId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get trending content
 * GET /api/tmdb/trending/:mediaType/:timeWindow
 */
const getTrending = async (req, res) => {
  try {
    const { mediaType, timeWindow } = req.params;
    const { page = 1 } = req.query;
    const data = await tmdbService.getTrending(mediaType, timeWindow, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get movie list by category
 * GET /api/tmdb/movie/now_playing, /api/tmdb/movie/popular, etc.
 */
const getMovieList = async (req, res) => {
  try {
    // Extract category from path (e.g., /movie/now_playing -> now_playing)
    const category = req.path.split("/").pop();
    const { page = 1 } = req.query;
    const data = await tmdbService.getMovieList(category, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get TV show list by category
 * GET /api/tmdb/tv/popular, /api/tmdb/tv/on_the_air, etc.
 */
const getTVList = async (req, res) => {
  try {
    // Extract category from path (e.g., /tv/popular -> popular)
    const category = req.path.split("/").pop();
    const { page = 1 } = req.query;
    const data = await tmdbService.getTVList(category, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get person details
 * GET /api/tmdb/person/:id
 */
const getPersonDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbService.getPersonDetails(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDetails,
  getCredits,
  getVideos,
  getWatchProviders,
  getRecommendations,
  searchMovie,
  searchMulti,
  findByImdbId,
  getTrending,
  getMovieList,
  getTVList,
  getPersonDetails,
};

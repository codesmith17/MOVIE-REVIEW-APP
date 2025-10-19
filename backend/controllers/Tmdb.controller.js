/**
 * TMDB Controller
 * Handles all TMDB proxy API requests with database caching
 * Cache-first strategy: Check DB cache before hitting TMDB API
 */

const tmdbService = require("../services/TmdbService");
const { sequelize } = require("../config/database");

// Cache expiration time in hours
const CACHE_EXPIRATION_HOURS = 12;

/**
 * Check cache and return data if valid
 * Returns null if cache doesn't exist or is expired
 */
async function getCachedData(cacheKey) {
  try {
    const result = await sequelize.query(
      `
      SELECT data, cached_at 
      FROM tmdb_cache 
      WHERE cache_key = :cacheKey
      AND cached_at > NOW() - INTERVAL '${CACHE_EXPIRATION_HOURS} hours'
    `,
      {
        replacements: {
          cacheKey,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (result && result.length > 0) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return {
        data: result[0].data,
        cached_at: result[0].cached_at,
        is_cached: true,
      };
    }

    console.log(`Cache MISS for key: ${cacheKey}`);
    return null;
  } catch (error) {
    console.error(`Cache read error for ${cacheKey}:`, error.message);
    return null;
  }
}

/**
 * Save data to cache
 * Updates existing cache or creates new entry
 */
async function saveCachedData(cacheKey, data) {
  try {
    await sequelize.query(
      `
      INSERT INTO tmdb_cache (cache_key, data, cached_at)
      VALUES (:cacheKey, :data, NOW())
      ON CONFLICT (cache_key)
      DO UPDATE SET data = :data, cached_at = NOW()
    `,
      {
        replacements: {
          cacheKey,
          data: JSON.stringify(data),
        },
      }
    );
    console.log(`Cache SAVED for key: ${cacheKey}`);
  } catch (error) {
    console.error(`Cache write error for ${cacheKey}:`, error.message);
  }
}

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

    // Only use cache for page 1 (homepage data)
    if (page == 1) {
      const cacheKey = `trending_${mediaType}_${timeWindow}`;
      const cachedResult = await getCachedData(cacheKey);

      if (cachedResult) {
        return res.json({
          results: cachedResult.data,
          page: 1,
          cache_status: {
            is_cached: true,
            cached_at: cachedResult.cached_at,
            cache_age_hours:
              Math.round(
                ((new Date() - new Date(cachedResult.cached_at)) / (1000 * 60 * 60)) * 10
              ) / 10,
          },
        });
      }
    }

    // Cache miss or not page 1 - fetch from TMDB
    const data = await tmdbService.getTrending(mediaType, timeWindow, page);

    // Save to cache for page 1
    if (page == 1 && data.results) {
      const cacheKey = `trending_${mediaType}_${timeWindow}`;
      await saveCachedData(cacheKey, data.results);
    }

    res.json({
      ...data,
      cache_status: {
        is_cached: false,
        cached_at: null,
        cache_age_hours: null,
      },
    });
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

    // Only use cache for page 1 (homepage data)
    if (page == 1) {
      const cacheKey = `${category}_movies`;
      const cachedResult = await getCachedData(cacheKey);

      if (cachedResult) {
        return res.json({
          results: cachedResult.data,
          page: 1,
          cache_status: {
            is_cached: true,
            cached_at: cachedResult.cached_at,
            cache_age_hours:
              Math.round(
                ((new Date() - new Date(cachedResult.cached_at)) / (1000 * 60 * 60)) * 10
              ) / 10,
          },
        });
      }
    }

    // Cache miss or not page 1 - fetch from TMDB
    const data = await tmdbService.getMovieList(category, page);

    // Save to cache for page 1
    if (page == 1 && data.results) {
      const cacheKey = `${category}_movies`;
      await saveCachedData(cacheKey, data.results);
    }

    res.json({
      ...data,
      cache_status: {
        is_cached: false,
        cached_at: null,
        cache_age_hours: null,
      },
    });
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

    // Only use cache for page 1 (homepage data)
    if (page == 1) {
      const cacheKey = `${category}_tv`;
      const cachedResult = await getCachedData(cacheKey);

      if (cachedResult) {
        return res.json({
          results: cachedResult.data,
          page: 1,
          cache_status: {
            is_cached: true,
            cached_at: cachedResult.cached_at,
            cache_age_hours:
              Math.round(
                ((new Date() - new Date(cachedResult.cached_at)) / (1000 * 60 * 60)) * 10
              ) / 10,
          },
        });
      }
    }

    // Cache miss or not page 1 - fetch from TMDB
    const data = await tmdbService.getTVList(category, page);

    // Save to cache for page 1
    if (page == 1 && data.results) {
      const cacheKey = `${category}_tv`;
      await saveCachedData(cacheKey, data.results);
    }

    res.json({
      ...data,
      cache_status: {
        is_cached: false,
        cached_at: null,
        cache_age_hours: null,
      },
    });
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

/**
 * Get user's region from IP address with timeout
 * Uses ipapi.co free tier (up to 1000 requests/day)
 */
const getUserRegion = async (ip) => {
  try {
    // Skip localhost/private IPs
    if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return "US"; // Default to US for local development
    }

    // Add timeout to prevent hanging (1 second max)
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
      const response = await fetch(`https://ipapi.co/${ip}/country/`, {
        headers: { "User-Agent": "MovieReviewApp/1.0" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const countryCode = await response.text();
        return countryCode.trim() || "US";
      }

      return "US"; // Fallback
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.log("IP geolocation timeout - using default US");
      }
      return "US"; // Fallback on timeout or error
    }
  } catch (error) {
    console.error("IP geolocation error:", error.message);
    return "US"; // Fallback to US
  }
};

/**
 * Get region-based popular movies (Trending Near You)
 * GET /api/tmdb/region/movies?region=US
 */
const getRegionalMovies = async (req, res) => {
  try {
    let { region, page = 1 } = req.query;

    // Auto-detect region from IP if not provided
    if (!region) {
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.socket.remoteAddress;
      region = await getUserRegion(clientIp);
    }

    // Cache key based on region
    if (page == 1) {
      const cacheKey = `regional_movies_${region.toUpperCase()}`;
      const cachedResult = await getCachedData(cacheKey);

      if (cachedResult) {
        return res.json({
          results: cachedResult.data,
          page: 1,
          region: region.toUpperCase(),
          cache_status: {
            is_cached: true,
            cached_at: cachedResult.cached_at,
            cache_age_hours:
              Math.round(
                ((new Date() - new Date(cachedResult.cached_at)) / (1000 * 60 * 60)) * 10
              ) / 10,
          },
        });
      }
    }

    const data = await tmdbService.discoverMoviesByRegion(region, page);

    // Save to cache for page 1
    if (page == 1 && data.results) {
      const cacheKey = `regional_movies_${region.toUpperCase()}`;
      await saveCachedData(cacheKey, data.results);
    }

    res.json({
      ...data,
      region: region.toUpperCase(),
      cache_status: {
        is_cached: false,
        cached_at: null,
        cache_age_hours: null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get region-based popular TV shows
 * GET /api/tmdb/region/tv?region=US
 */
const getRegionalTV = async (req, res) => {
  try {
    let { region, page = 1 } = req.query;

    // Auto-detect region from IP if not provided
    if (!region) {
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.socket.remoteAddress;
      region = await getUserRegion(clientIp);
    }

    // Cache key based on region
    if (page == 1) {
      const cacheKey = `regional_tv_${region.toUpperCase()}`;
      const cachedResult = await getCachedData(cacheKey);

      if (cachedResult) {
        return res.json({
          results: cachedResult.data,
          page: 1,
          region: region.toUpperCase(),
          cache_status: {
            is_cached: true,
            cached_at: cachedResult.cached_at,
            cache_age_hours:
              Math.round(
                ((new Date() - new Date(cachedResult.cached_at)) / (1000 * 60 * 60)) * 10
              ) / 10,
          },
        });
      }
    }

    const data = await tmdbService.discoverTVByRegion(region, page);

    // Save to cache for page 1
    if (page == 1 && data.results) {
      const cacheKey = `regional_tv_${region.toUpperCase()}`;
      await saveCachedData(cacheKey, data.results);
    }

    res.json({
      ...data,
      region: region.toUpperCase(),
      cache_status: {
        is_cached: false,
        cached_at: null,
        cache_age_hours: null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get now playing movies in user's region
 * GET /api/tmdb/region/now-playing?region=US
 */
const getNowPlayingRegional = async (req, res) => {
  try {
    let { region, page = 1 } = req.query;

    // Auto-detect region from IP if not provided
    if (!region) {
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.socket.remoteAddress;
      region = await getUserRegion(clientIp);
    }

    // Cache key based on region
    if (page == 1) {
      const cacheKey = `now_playing_${region.toUpperCase()}`;
      const cachedData = await getCachedData(cacheKey);

      if (cachedData) {
        return res.json({ results: cachedData, page: 1, region: region.toUpperCase() });
      }
    }

    const data = await tmdbService.getNowPlayingByRegion(region, page);
    res.json({ ...data, region: region.toUpperCase() });
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
  getRegionalMovies,
  getRegionalTV,
  getNowPlayingRegional,
};

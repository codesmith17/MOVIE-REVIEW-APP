/**
 * Trending Movies Fetcher
 *
 * This script fetches trending movies from TMDB and caches them in the database.
 * Designed to run as a GitHub Actions cron job daily.
 *
 * Usage: node scripts/fetch-trending.js
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN;

/**
 * Fetch data from TMDB API
 */
async function fetchFromTMDB(endpoint) {
  const fetch =
    globalThis.fetch ||
    ((...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)));

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create trending cache table if it doesn't exist
 */
async function createCacheTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS trending_cache (
      cache_key VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("Trending cache table ready");
}

/**
 * Store trending data in cache
 */
async function storeTrendingData(cacheKey, data) {
  await sequelize.query(
    `
    INSERT INTO trending_cache (
      cache_key,
      data,
      cached_at
    ) VALUES (
      :cacheKey,
      :data,
      NOW()
    )
    ON CONFLICT (cache_key)
    DO UPDATE SET
      data = :data,
      cached_at = NOW()
  `,
    {
      replacements: {
        cacheKey,
        data: JSON.stringify(data),
      },
    }
  );
  console.log(`Cached ${data.length} items for key: ${cacheKey}`);
}

/**
 * Main execution function
 */
async function fetchAndCacheTrending() {
  try {
    console.log("=".repeat(50));
    console.log("Starting trending movies fetch job");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(50));

    // Ensure table exists
    await createCacheTable();

    // Fetch daily trending movies
    console.log("\nFetching daily trending movies...");
    const dailyMovies = await fetchFromTMDB("/trending/movie/day?language=en-US");
    await storeTrendingData("trending_movies_day", dailyMovies.results);

    // Fetch weekly trending movies
    console.log("\nFetching weekly trending movies...");
    const weeklyMovies = await fetchFromTMDB("/trending/movie/week?language=en-US");
    await storeTrendingData("trending_movies_week", weeklyMovies.results);

    // Fetch daily trending TV shows
    console.log("\nFetching daily trending TV shows...");
    const dailyTV = await fetchFromTMDB("/trending/tv/day?language=en-US");
    await storeTrendingData("trending_tv_day", dailyTV.results);

    // Fetch weekly trending TV shows
    console.log("\nFetching weekly trending TV shows...");
    const weeklyTV = await fetchFromTMDB("/trending/tv/week?language=en-US");
    await storeTrendingData("trending_tv_week", weeklyTV.results);

    // Fetch popular movies
    console.log("\nFetching popular movies...");
    const popularMovies = await fetchFromTMDB("/movie/popular?language=en-US&page=1");
    await storeTrendingData("popular_movies", popularMovies.results);

    // Fetch now playing movies
    console.log("\nFetching now playing movies...");
    const nowPlaying = await fetchFromTMDB("/movie/now_playing?language=en-US&page=1");
    await storeTrendingData("now_playing_movies", nowPlaying.results);

    // Fetch upcoming movies
    console.log("\nFetching upcoming movies...");
    const upcoming = await fetchFromTMDB("/movie/upcoming?language=en-US&page=1");
    await storeTrendingData("upcoming_movies", upcoming.results);

    console.log("\n" + "=".repeat(50));
    console.log("Trending movies fetch job completed successfully");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("ERROR: Trending movies fetch job failed");
    console.error("=".repeat(50));
    console.error("\nError details:", error.message);
    console.error("\nStack trace:", error.stack);

    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("\nDatabase connection closed");
  }
}

// Run the script
fetchAndCacheTrending();

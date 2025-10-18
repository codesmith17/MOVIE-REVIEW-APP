/**
 * TMDB Data Cache Fetcher
 *
 * This script fetches movies and TV shows from TMDB and caches them in the database.
 * This reduces API calls and improves app performance by serving cached data.
 * Designed to run as a GitHub Actions cron job multiple times daily.
 *
 * Usage: node scripts/fetch-tmdb-data.js
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
 * Create TMDB cache table if it doesn't exist
 */
async function createCacheTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS tmdb_cache (
      cache_key VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("TMDB cache table ready");
}

/**
 * Store TMDB data in cache
 */
async function storeCachedData(cacheKey, data) {
  await sequelize.query(
    `
    INSERT INTO tmdb_cache (
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
async function fetchAndCacheAllData() {
  try {
    console.log("=".repeat(50));
    console.log("Starting TMDB data cache job");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(50));

    // Ensure table exists
    await createCacheTable();

    // ============ MOVIES ============
    console.log("\n📽️  FETCHING MOVIES...\n");

    // Trending movies
    console.log("Fetching daily trending movies...");
    const dailyMovies = await fetchFromTMDB("/trending/movie/day?language=en-US");
    await storeCachedData("trending_movies_day", dailyMovies.results);

    console.log("Fetching weekly trending movies...");
    const weeklyMovies = await fetchFromTMDB("/trending/movie/week?language=en-US");
    await storeCachedData("trending_movies_week", weeklyMovies.results);

    // Movie categories
    console.log("Fetching popular movies...");
    const popularMovies = await fetchFromTMDB("/movie/popular?language=en-US&page=1");
    await storeCachedData("popular_movies", popularMovies.results);

    console.log("Fetching now playing movies...");
    const nowPlaying = await fetchFromTMDB("/movie/now_playing?language=en-US&page=1");
    await storeCachedData("now_playing_movies", nowPlaying.results);

    console.log("Fetching upcoming movies...");
    const upcoming = await fetchFromTMDB("/movie/upcoming?language=en-US&page=1");
    await storeCachedData("upcoming_movies", upcoming.results);

    console.log("Fetching top rated movies...");
    const topRatedMovies = await fetchFromTMDB("/movie/top_rated?language=en-US&page=1");
    await storeCachedData("top_rated_movies", topRatedMovies.results);

    // ============ TV SHOWS ============
    console.log("\n📺  FETCHING TV SHOWS...\n");

    // Trending TV shows
    console.log("Fetching daily trending TV shows...");
    const dailyTV = await fetchFromTMDB("/trending/tv/day?language=en-US");
    await storeCachedData("trending_tv_day", dailyTV.results);

    console.log("Fetching weekly trending TV shows...");
    const weeklyTV = await fetchFromTMDB("/trending/tv/week?language=en-US");
    await storeCachedData("trending_tv_week", weeklyTV.results);

    // TV show categories
    console.log("Fetching popular TV shows...");
    const popularTV = await fetchFromTMDB("/tv/popular?language=en-US&page=1");
    await storeCachedData("popular_tv", popularTV.results);

    console.log("Fetching on the air TV shows...");
    const onTheAirTV = await fetchFromTMDB("/tv/on_the_air?language=en-US&page=1");
    await storeCachedData("on_the_air_tv", onTheAirTV.results);

    console.log("Fetching top rated TV shows...");
    const topRatedTV = await fetchFromTMDB("/tv/top_rated?language=en-US&page=1");
    await storeCachedData("top_rated_tv", topRatedTV.results);

    console.log("Fetching airing today TV shows...");
    const airingTodayTV = await fetchFromTMDB("/tv/airing_today?language=en-US&page=1");
    await storeCachedData("airing_today_tv", airingTodayTV.results);

    console.log("\n" + "=".repeat(50));
    console.log("✅ TMDB data cache job completed successfully");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ ERROR: TMDB data cache job failed");
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
fetchAndCacheAllData();

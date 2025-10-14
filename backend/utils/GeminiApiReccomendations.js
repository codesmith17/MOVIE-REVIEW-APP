// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const GOOGLE_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const TMDB_BEARER_TOKEN =
  process.env.TMDB_BEARER_TOKEN || process.env.VITE_TMDB_BEARER_TOKEN;

let genAI = null;
let model = null;

if (GOOGLE_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Gemini AI initialization failed:", error.message);
  }
} else {
  console.warn(
    "Gemini API key not found. AI recommendations will be disabled.",
  );
}
const fetchRecommendations = async (imdbID, title, year) => {
  if (!model) {
    console.warn(
      "Gemini model not initialized. Returning empty recommendations.",
    );
    return [];
  }

  const prompt = `Suggest similar 5-6 movies or shows to this movie: "${title}" (${year}), IMDb ID: ${imdbID}. In your response, just give names of the movies. You can suggest similar genre films, same franchise films, same language films, or popular films released in the same year. Provide the response as a simple comma-separated list of movie titles.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const movieTitles = text.split(",").map((title) => title.trim());

    // Fetch IMDb IDs and poster images for each movie
    const moviesWithDetails = await Promise.all(
      movieTitles.map(fetchMovieDetails),
    );

    // console.log(moviesWithDetails);
    return moviesWithDetails.filter((movie) => movie !== null);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};
const trendingMovies = async () => {
  if (!model) {
    console.warn(
      "Gemini model not initialized. Returning empty trending movies.",
    );
    return [];
  }

  const prompt = `Suggest currently 12 trending movies or even shows or movies. Give a mix of popular films and movies that are poular in theatres currently and justt released in the present current year. In your response, just give names of the movies. Provide the response as a simple comma-separated list of movie titles.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const movieTitles = text.split(",").map((title) => title.trim());

    // Fetch IMDb IDs and poster images for each movie
    const moviesWithDetails = await Promise.all(
      movieTitles.map((singleTitle) => fetchMovieDetails(singleTitle)),
    );

    // console.log(moviesWithDetails);
    return moviesWithDetails.filter((movie) => movie !== null);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};
async function fetchMovieDetails(title) {
  try {
    // Use TMDB search API instead of OMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}&language=en-US&page=1`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
      },
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      const isMovie = item.media_type === "movie";
      const isTV = item.media_type === "tv";

      return {
        year: isMovie
          ? item.release_date
            ? item.release_date.substring(0, 4)
            : null
          : item.first_air_date
            ? item.first_air_date.substring(0, 4)
            : null,
        type: isMovie ? "movie" : isTV ? "series" : item.media_type,
        name: isMovie ? item.title : item.name,
        imdbID: `${item.media_type}-${item.id}`, // Use TMDB ID format
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
      };
    } else {
      console.warn(`Movie not found: ${title}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}
module.exports = { fetchRecommendations, trendingMovies };

// fetchRecommendations("tt0086250", "Scarface", "1980");

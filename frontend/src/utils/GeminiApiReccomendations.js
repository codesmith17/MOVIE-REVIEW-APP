import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export const fetchRecommendations = async (imdbID, title, year) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Suggest similar movies to this movie: "${title}" (${year}), IMDb ID: ${imdbID}. In your response, just give names of the movies. You can suggest similar genre films, same franchise films, same language films, or popular films released in the same year. Provide the response as a simple comma-separated list of movie titles.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const movieTitles = text.split(",").map((title) => title.trim());

    // Fetch IMDb IDs and poster images for each movie
    const moviesWithDetails = await Promise.all(movieTitles.map(fetchMovieDetails));

    console.log(moviesWithDetails);
    return moviesWithDetails.filter((movie) => movie !== null);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

async function fetchMovieDetails(title) {
  try {
    // Use backend TMDB proxy API
    const response = await fetch(
      `${API_BASE_URL}/api/tmdb/search/movie?query=${encodeURIComponent(title)}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      return {
        name: movie.title,
        imdbID: `movie-${movie.id}`, // Use TMDB ID format
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        Year: movie.release_date ? movie.release_date.substring(0, 4) : null,
        Title: movie.title,
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

// fetchRecommendations("tt0086250", "Scarface", "1980");

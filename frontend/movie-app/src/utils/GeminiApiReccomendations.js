import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAfFJIE6VNGi4479FOqu2XAGsoOZJNIICU");

export const fetchRecommendations = async(imdbID, title, year) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Suggest similar movies to this movie: "${title}" (${year}), IMDb ID: ${imdbID}. In your response, just give names of the movies. You can suggest similar genre films, same franchise films, same language films, or popular films released in the same year. Provide the response as a simple comma-separated list of movie titles.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const movieTitles = text.split(',').map(title => title.trim());

        // Fetch IMDb IDs and poster images for each movie
        const moviesWithDetails = await Promise.all(movieTitles.map(fetchMovieDetails));

        console.log(moviesWithDetails);
        return moviesWithDetails.filter(movie => movie !== null);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};

async function fetchMovieDetails(title) {
    try {
        const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=1f0a0eb9`);
        const data = await response.json();

        if (data.Response === "True") {
            return {
                ...data,
                name: data.Title,
                imdbID: data.imdbID,
                poster: data.Poster !== "N/A" ? data.Poster : null
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
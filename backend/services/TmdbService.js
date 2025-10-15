/**
 * TMDB API Service
 * Centralized service for all TMDB API calls
 * Keeps the Bearer token secure on the server
 */

class TmdbService {
  constructor() {
    this.baseURL = "https://api.themoviedb.org/3";
    this.bearerToken = process.env.TMDB_BEARER_TOKEN;

    if (!this.bearerToken) {
      console.error("TMDB_BEARER_TOKEN is not set in environment variables");
    }
  }

  /**
   * Generic GET request to TMDB API
   */
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.bearerToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`TMDB API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * Get movie or TV show details
   */
  async getDetails(mediaType, id, params = {}) {
    return this.get(`/${mediaType}/${id}`, { language: "en-US", ...params });
  }

  /**
   * Get credits (cast & crew)
   */
  async getCredits(mediaType, id) {
    return this.get(`/${mediaType}/${id}/credits`, { language: "en-US" });
  }

  /**
   * Get videos (trailers, teasers, etc.)
   */
  async getVideos(mediaType, id) {
    return this.get(`/${mediaType}/${id}/videos`, { language: "en-US" });
  }

  /**
   * Get watch providers
   */
  async getWatchProviders(mediaType, id) {
    return this.get(`/${mediaType}/${id}/watch/providers`);
  }

  /**
   * Get recommendations
   */
  async getRecommendations(mediaType, id, page = 1) {
    return this.get(`/${mediaType}/${id}/recommendations`, {
      language: "en-US",
      page,
    });
  }

  /**
   * Search movies
   */
  async searchMovie(query, page = 1) {
    return this.get("/search/movie", {
      query: encodeURIComponent(query),
      language: "en-US",
      page,
    });
  }

  /**
   * Search multi (movies, TV shows, people)
   */
  async searchMulti(query, page = 1) {
    return this.get("/search/multi", {
      query: encodeURIComponent(query),
      language: "en-US",
      page,
    });
  }

  /**
   * Find by external ID (IMDB ID)
   */
  async findByImdbId(imdbId) {
    return this.get(`/find/${imdbId}`, {
      external_source: "imdb_id",
      language: "en-US",
    });
  }

  /**
   * Get trending content
   */
  async getTrending(mediaType, timeWindow = "day", page = 1) {
    return this.get(`/trending/${mediaType}/${timeWindow}`, {
      language: "en-US",
      page,
    });
  }

  /**
   * Get movie list by category
   */
  async getMovieList(category, page = 1) {
    const validCategories = ["now_playing", "popular", "upcoming", "top_rated"];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid movie category: ${category}`);
    }
    return this.get(`/movie/${category}`, { language: "en-US", page });
  }

  /**
   * Get TV show list by category
   */
  async getTVList(category, page = 1) {
    const validCategories = ["popular", "on_the_air", "top_rated", "airing_today"];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid TV category: ${category}`);
    }
    return this.get(`/tv/${category}`, { language: "en-US", page });
  }

  /**
   * Get person details with combined credits
   */
  async getPersonDetails(id) {
    return this.get(`/person/${id}`, {
      append_to_response: "combined_credits",
      language: "en-US",
    });
  }
}

// Export singleton instance
module.exports = new TmdbService();

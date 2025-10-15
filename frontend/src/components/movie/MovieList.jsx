import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MovieCard from "./MovieCard";
import { Loading } from "../common";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

const MovieList = () => {
  const [movieData, setMovieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());
  const location = useLocation();
  const observer = useRef();

  const handleImageError = (itemId) => {
    setImageErrors((prev) => new Set(prev).add(itemId));
  };

  const renderFallbackImage = (item) => (
    <div className="w-full sm:w-32 h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
      <div className="text-4xl mb-2">🎬</div>
      <div className="text-xs text-center px-2 font-medium">
        {item.media_type === "movie" ? "Movie" : "TV Show"}
      </div>
      <div className="text-xs text-center px-2 mt-1 line-clamp-2">
        {(item.title || item.name)?.slice(0, 20)}...
      </div>
    </div>
  );

  const fetchMovies = useCallback(async (searchText, pageNum) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tmdb/search/multi?query=${searchText}&page=${pageNum}`
      );
      const data = await response.json();
      if (data.status_code === 7) {
        setError("Invalid API key. Please contact support or check your API key.");
        setMovieData([]);
        setHasMore(false);
        return;
      }
      if (data.success === false) {
        setError(data.status_message || "An error occurred while fetching movies.");
        setMovieData([]);
        setHasMore(false);
        return;
      }
      if (data.results) {
        const filteredResults = data.results.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
        setMovieData((prevData) => [...prevData, ...filteredResults]);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Network error. Please try again.");
      setMovieData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchText = searchParams.get("searchText");

    if (!searchText) {
      setLoading(false);
      return;
    }

    setMovieData([]);
    setPage(1);
    fetchMovies(searchText, 1);
  }, [location.search, fetchMovies]);

  const lastMovieElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (page > 1) {
      const searchParams = new URLSearchParams(location.search);
      const searchText = searchParams.get("searchText");
      fetchMovies(searchText, page);
    }
  }, [page, fetchMovies, location.search]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && <Loading />}
        {error && <div className="text-red-400 text-center my-4">{error}</div>}
        {!loading && !error && movieData.length === 0 && (
          <p className="text-gray-300 text-center">No movies or TV shows found</p>
        )}
        <div className="flex flex-col gap-6">
          {movieData.map((item, index) => (
            <Link
              key={item.media_type + "-" + item.id}
              to={`/${item.media_type}/${item.id}`}
              className="flex flex-col sm:flex-row bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              ref={index === movieData.length - 1 ? lastMovieElementRef : null}
            >
              {!item.poster_path || imageErrors.has(item.id) ? (
                renderFallbackImage(item)
              ) : (
                <img
                  src={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
                  alt={item.title || item.name}
                  crossOrigin="anonymous"
                  className="w-full sm:w-32 h-48 object-cover bg-gray-800 flex-shrink-0"
                  loading="lazy"
                  onError={() => handleImageError(item.id)}
                />
              )}
              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {item.media_type === "movie" ? item.title : item.name}{" "}
                    <span className="text-gray-400 font-normal">
                      {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                    </span>
                  </h3>
                  {item.overview && (
                    <p className="text-gray-300 mt-2 line-clamp-2">{item.overview}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.vote_average && (
                    <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">
                      ⭐ {item.vote_average.toFixed(1)}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${item.media_type === "movie" ? "bg-blue-600" : "bg-green-600"} text-white`}
                  >
                    {item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;

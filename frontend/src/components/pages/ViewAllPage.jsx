import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MovieCard } from "../movie";
import axios from "../../utils/axiosConfig";

/**
 * ViewAllPage - Generic page to view all movies/shows for a specific category
 * Supports: trending, popular, top_rated, upcoming, now_playing, regional, etc.
 */
const ViewAllPage = () => {
  const { category, mediaType = "movie", timeWindow = "day" } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Category display names
  const categoryTitles = {
    trending: `Trending ${mediaType === "tv" ? "TV Shows" : "Movies"} ${timeWindow === "week" ? "This Week" : "Today"}`,
    popular: `Popular ${mediaType === "tv" ? "TV Shows" : "Movies"}`,
    top_rated: `Top Rated ${mediaType === "tv" ? "TV Shows" : "Movies"}`,
    upcoming: "Upcoming Movies",
    now_playing: "Now Playing in Theaters",
    regional: `Trending Near You`,
    on_the_air: "On The Air",
    airing_today: "Airing Today",
  };

  // Build endpoint based on category
  const getEndpoint = () => {
    const base = "/api/tmdb";

    switch (category) {
      case "trending":
        return `${base}/trending/${mediaType}/${timeWindow}`;
      case "regional":
        if (mediaType === "tv") {
          return `${base}/region/tv`;
        }
        return `${base}/region/movies`;
      default:
        return `${base}/${mediaType}/${category}`;
    }
  };

  // Fetch movies/shows
  const fetchItems = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const endpoint = getEndpoint();
      const { data } = await axios.get(`${endpoint}?page=${pageNum}`, {
        timeout: 15000,
      });

      const results = data.results || [];

      if (append) {
        setItems((prev) => [...prev, ...results]);
      } else {
        setItems(results);
      }

      // Check if there are more pages
      setHasMore(data.page < data.total_pages && results.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchItems(1, false);
  }, [category, mediaType, timeWindow]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchItems(page + 1, true);
    }
  };

  const title =
    categoryTitles[category] ||
    `${category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;

  return (
    <div className="min-h-screen bg-[#0a0e27] text-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text">{title}</h1>
          <p className="text-gray-400 mt-2">
            {items.length} {mediaType === "tv" ? "shows" : "movies"} found
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="shimmer-card">
                <div className="w-full aspect-[2/3] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl mb-2 shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-full shimmer"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No {mediaType === "tv" ? "shows" : "movies"} found
            </p>
          </div>
        ) : (
          <>
            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((item) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  title={item.title || item.name}
                  year={(item.release_date || item.first_air_date || "").slice(0, 4)}
                  type={mediaType}
                  image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  rating={item.vote_average}
                  mediaType={mediaType}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-primary px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            #1f2937 0%,
            #374151 20%,
            #1f2937 40%,
            #1f2937 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
};

export default ViewAllPage;

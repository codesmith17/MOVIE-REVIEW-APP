import { useState, useEffect, useRef, useCallback } from "react";
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
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

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
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchItems(1, false);
  }, [category, mediaType, timeWindow]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchItems(page + 1, true);
    }
  }, [loadingMore, hasMore, page, loading]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px", // Trigger 200px before reaching the element
        threshold: 0.1,
      }
    );

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore]);

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

            {/* Infinite Scroll Trigger & Loading Indicator */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center mt-12 py-8">
                {loadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-blue-500"></div>
                    <p className="text-gray-400 text-sm">
                      Loading more {mediaType === "tv" ? "shows" : "movies"}...
                    </p>
                  </div>
                ) : (
                  <div className="h-20" />
                )}
              </div>
            )}

            {/* End of Results */}
            {!hasMore && items.length > 0 && (
              <div className="text-center mt-12 py-8">
                <p className="text-gray-500 text-sm">You've reached the end! 🎬</p>
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

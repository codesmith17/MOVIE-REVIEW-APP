import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaCalendarAlt,
  FaFilm,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaSortAmountDown,
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
const ITEMS_PER_PAGE = 12;

const ReviewsListPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest
  const [filterType, setFilterType] = useState("all"); // all, movie, tv

  useEffect(() => {
    fetchReviews();
  }, [username]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/getReviews/${username}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setFilteredReviews(data.reviews);
      } else {
        toast.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllMovieDetails = async () => {
      const details = {};
      const fetchPromises = reviews.map(async (review) => {
        try {
          let mediaType = "movie";
          let mediaId = review.imdbID;

          if (typeof review.imdbID === "string") {
            if (review.imdbID.startsWith("tv-")) {
              mediaType = "tv";
              mediaId = review.imdbID.replace("tv-", "");
            } else if (review.imdbID.startsWith("movie-")) {
              mediaType = "movie";
              mediaId = review.imdbID.replace("movie-", "");
            }
          }

          const response = await fetch(`${API_BASE_URL}/api/tmdb/${mediaType}/${mediaId}`);

          if (response.ok) {
            const data = await response.json();
            details[review.imdbID] = {
              ...data,
              mediaType,
            };
          }
        } catch (error) {
          console.error(`Error fetching details for ${review.imdbID}:`, error);
        }
      });

      await Promise.all(fetchPromises);
      setMovieDetails(details);
    };

    if (reviews.length > 0) {
      fetchAllMovieDetails();
    }
  }, [reviews]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...reviews];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((review) => {
        const mediaData = movieDetails[review.imdbID];
        const title = mediaData?.mediaType === "tv" ? mediaData.name : mediaData?.title;
        return (
          title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.review?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter((review) => {
        const mediaData = movieDetails[review.imdbID];
        return mediaData?.mediaType === filterType;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateLogged) - new Date(a.dateLogged);
        case "oldest":
          return new Date(a.dateLogged) - new Date(b.dateLogged);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, filterType, reviews, movieDetails]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner className="text-cyan-500 text-5xl" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/user/${username}`)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
          >
            <FaArrowLeft /> Back to Profile
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {username}'s Reviews
          </h1>
          <p className="text-gray-400 text-lg">
            {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"} found
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-700/50 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Filter by Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies Only</option>
                <option value="tv">TV Shows Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        {currentReviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence mode="popLayout">
                {currentReviews.map((review, index) => {
                  const mediaData = movieDetails[review.imdbID];
                  if (!mediaData) return null;

                  const isTV = mediaData.mediaType === "tv";
                  const title = isTV ? mediaData.name : mediaData.title;
                  const releaseDate = isTV ? mediaData.first_air_date : mediaData.release_date;
                  const mediaTypeLabel = isTV ? "TV Show" : "Movie";

                  return (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link to={`/movie-page/${review.imdbID}/${review._id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="group bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-600/30 h-full"
                        >
                          <div className="flex items-start p-5">
                            <div className="relative flex-shrink-0">
                              {mediaData.poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w200${mediaData.poster_path}`}
                                  alt={title}
                                  className="w-24 h-36 object-cover rounded-xl shadow-lg"
                                />
                              ) : (
                                <div className="w-24 h-36 bg-gray-600 rounded-xl shadow-lg flex items-center justify-center">
                                  <FaFilm className="text-gray-400 text-3xl" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
                              <div className="absolute top-2 right-2 bg-cyan-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-semibold">
                                {mediaTypeLabel}
                              </div>
                            </div>

                            <div className="ml-5 flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-2 text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                                {title || "Unknown Title"}
                              </h4>
                              <p className="text-sm text-gray-400 mb-3">
                                {releaseDate?.split("-")[0] || "N/A"} •{" "}
                                {mediaData.genres?.[0]?.name || mediaTypeLabel}
                              </p>
                              <div className="flex items-center mb-3 gap-2 flex-wrap">
                                <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-lg">
                                  <FaStar className="text-yellow-400 mr-1.5 text-sm" />
                                  <span className="font-bold text-white text-sm">
                                    {review.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 pb-5">
                            <p
                              className="text-sm text-gray-300 line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: review.review.substring(0, 200) + "...",
                              }}
                            />
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <FaCalendarAlt className="mr-2" />
                              <span>{new Date(review.dateLogged).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-2 flex-wrap"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-all"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                            : "bg-gray-700/50 text-white hover:bg-gray-600/50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-all"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-3xl font-bold text-gray-200 mb-3">No reviews found</h3>
            <p className="text-gray-400 text-lg">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your filters"
                : "This user hasn't written any reviews yet"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReviewsListPage;

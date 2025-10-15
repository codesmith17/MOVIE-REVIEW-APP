import { FaEye, FaEdit, FaStar, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MovieActivitySection = ({
  movieId,
  imdbID,
  movieTitle,
  onEditReview,
  activityRefreshKey,
}) => {
  const [userActivity, setUserActivity] = useState({
    hasReview: false,
    review: null,
    isWatched: false,
    rating: 0,
    dateLogged: null,
  });
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user.data);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!imdbID || !user?.data?.username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user's personal review for this movie
        const reviewResponse = await fetch(
          `${API_BASE_URL}/api/review/getPersonalReview/${imdbID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (reviewResponse.ok && reviewResponse.status !== 204) {
          const reviewData = await reviewResponse.json();
          if (reviewData.review) {
            const hasReviewText = Boolean(
              reviewData.review.review && reviewData.review.review.trim()
            );
            const hasRating = reviewData.review.rating > 0;
            setUserActivity({
              hasReview: hasReviewText,
              review: reviewData.review,
              isWatched: hasReviewText || hasRating,
              rating: reviewData.review.rating || 0,
              dateLogged: reviewData.review.dateLogged,
            });
          }
        } else {
          // No review found
          setUserActivity({
            hasReview: false,
            review: null,
            isWatched: false,
            rating: 0,
            dateLogged: null,
          });
        }
      } catch (error) {
        console.error("Error fetching user activity:", error);
        setUserActivity({
          hasReview: false,
          review: null,
          isWatched: false,
          rating: 0,
          dateLogged: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [imdbID, user, activityRefreshKey]);

  const getStatusInfo = () => {
    if (userActivity.hasReview) {
      return {
        icon: FaEye,
        label: "Reviewed",
        color: "bg-green-600",
        textColor: "text-green-400",
      };
    } else if (userActivity.isWatched) {
      return {
        icon: FaEye,
        label: "Watched",
        color: "bg-blue-600",
        textColor: "text-blue-400",
      };
    } else {
      return {
        icon: FaEye,
        label: "Watch",
        color: "bg-gray-600",
        textColor: "text-gray-400",
      };
    }
  };

  if (!user?.data?.username) {
    return null; // Don't show for non-logged-in users
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Helper for consistent date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    let dateObj;
    if (dateStr.includes("GMT")) {
      dateObj = new Date(dateStr);
    } else if (dateStr.includes("/")) {
      // dd/mm/yyyy
      const [d, m, y] = dateStr.split("/");
      dateObj = new Date(`${y}-${m}-${d}`);
    } else {
      dateObj = new Date(dateStr);
    }
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-2xl p-4 md:p-6 mb-8 mt-8 shadow-lg"
    >
      <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Your Activity</h3>

      {/* Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {/* Watch Status */}
        <div className="bg-gray-900 rounded-xl p-3 md:p-4 text-center flex flex-col items-center justify-center min-h-[80px]">
          <div
            className={`mx-auto w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3 ${statusInfo.color}`}
          >
            <StatusIcon className="text-lg md:text-xl text-white" />
          </div>
          <div className={`text-base md:text-lg font-semibold ${statusInfo.textColor}`}>
            {statusInfo.label}
          </div>
        </div>

        {/* Rating */}
        <div className="bg-gray-900 rounded-xl p-3 md:p-4 text-center flex flex-col items-center justify-center min-h-[80px]">
          <div className="mx-auto w-9 h-9 md:w-12 md:h-12 rounded-full bg-yellow-600 flex items-center justify-center mb-2 md:mb-3">
            <FaStar className="text-lg md:text-xl text-white" />
          </div>
          <div className="text-base md:text-lg font-semibold text-yellow-400">
            {userActivity.rating > 0 ? `${userActivity.rating}/5` : "Not Rated"}
          </div>
        </div>

        {/* Date */}
        <div className="bg-gray-900 rounded-xl p-3 md:p-4 text-center flex flex-col items-center justify-center min-h-[80px]">
          <div className="mx-auto w-9 h-9 md:w-12 md:h-12 rounded-full bg-purple-600 flex items-center justify-center mb-2 md:mb-3">
            <FaCalendarAlt className="text-lg md:text-xl text-white" />
          </div>
          <div className="text-base md:text-lg font-semibold text-purple-400 break-all">
            {formatDate(userActivity.dateLogged)}
          </div>
        </div>
      </div>

      {/* Show Your Activity Section */}
      {(userActivity.hasReview || (userActivity.isWatched && userActivity.rating > 0)) && (
        <div className="bg-gray-900 rounded-xl p-3 md:p-4">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h4 className="text-base md:text-lg font-semibold text-white">Show Your Activity</h4>
            <Link
              to={`/movie-activity/${movieId}/${user.data.username}`}
              className="text-blue-400 hover:text-blue-300 text-xs md:text-sm"
            >
              View Activity for this Movie →
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div>
                <h5 className="font-semibold text-white text-sm md:text-base">{movieTitle}</h5>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`text-xs md:text-sm ${
                        index < userActivity.rating ? "text-yellow-400" : "text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="text-gray-400 text-xs md:text-sm ml-2">
                    {formatDate(userActivity.dateLogged)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onEditReview?.(userActivity.review)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center"
              >
                <FaEdit className="mr-1" />
                {userActivity.hasReview ? "Edit" : "Add Review"}
              </button>
            </div>

            {userActivity.hasReview ? (
              userActivity.review?.review && (
                <div
                  className="text-gray-300 text-xs md:text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: userActivity.review.review.substring(0, 150) + "...",
                  }}
                />
              )
            ) : (
              <div className="text-gray-400 text-xs md:text-sm italic">Not Reviewed</div>
            )}
          </div>
        </div>
      )}

      {/* No Activity Message */}
      {!userActivity.hasReview && !userActivity.isWatched && (
        <div className="text-center py-6 md:py-8">
          <p className="text-gray-400 mb-2 md:mb-4 text-sm md:text-base">
            You haven't reviewed this {movieId ? "movie" : "show"} yet.
          </p>
          <Link
            to={`/movie-activity/${movieId}/${user.data.username}`}
            className="text-blue-400 hover:text-blue-300 text-xs md:text-sm"
          >
            View activity for this movie →
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default MovieActivitySection;

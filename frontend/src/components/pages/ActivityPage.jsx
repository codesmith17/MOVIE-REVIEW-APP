import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaStar, FaEdit, FaCalendarAlt, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Modal } from "../modals";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../styles/quill-dark.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const ActivityPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.data);

  const [activities, setActivities] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    review: "",
    rating: 0,
    dateLogged: null,
  });

  const isCurrentUser = user?.data?.username === username;

  useEffect(() => {
    fetchUserActivities();
  }, [username]);

  const fetchUserActivities = async () => {
    try {
      setLoading(true);

      // Fetch user reviews
      const reviewsResponse = await fetch(`${API_BASE_URL}/api/review/getReviews/${username}`);

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        const reviews = reviewsData.reviews || [];

        // Sort by date (most recent first)
        const sortedReviews = reviews.sort(
          (a, b) => new Date(b.dateLogged) - new Date(a.dateLogged)
        );

        setActivities(sortedReviews);

        // Fetch movie details for each review
        fetchMovieDetails(sortedReviews);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (reviews) => {
    const details = {};

    await Promise.all(
      reviews.map(async (review) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${review.imdbID}?language=en-US`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
              },
            }
          );

          if (response.ok) {
            const movieData = await response.json();
            details[review.imdbID] = movieData;
          }
        } catch (error) {
          console.error(`Error fetching movie ${review.imdbID}:`, error);
        }
      })
    );

    setMovieDetails(details);
  };

  const handleEditClick = (activity) => {
    setEditingReview(activity);
    setEditForm({
      review: activity.review || "",
      rating: activity.rating || 0,
      dateLogged: activity.dateLogged
        ? new Date(activity.dateLogged.split("/").reverse().join("-"))
        : null,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formattedDate = editForm.dateLogged
        ? `${editForm.dateLogged.getDate()}/${editForm.dateLogged.getMonth() + 1}/${editForm.dateLogged.getFullYear()}`
        : editingReview.dateLogged;

      const response = await fetch(`${API_BASE_URL}/api/review/updateReview/${editingReview._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          review: editForm.review,
          rating: editForm.rating,
          dateLogged: formattedDate,
        }),
      });

      if (response.ok) {
        toast.success("Review updated successfully!");
        setShowEditModal(false);
        setEditingReview(null);
        fetchUserActivities(); // Refresh the list
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const ActivityCard = ({ activity, movieData }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
    >
      <div className="flex gap-4">
        {/* Movie Poster */}
        <Link to={`/movie/${activity.imdbID}`} className="flex-shrink-0">
          <img
            src={`https://image.tmdb.org/t/p/w200${movieData?.poster_path}`}
            alt={movieData?.title}
            className="w-24 h-36 object-cover rounded-lg hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/200x300?text=No+Image";
            }}
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Link
                to={`/movie/${activity.imdbID}`}
                className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
              >
                {movieData?.title || "Unknown Title"}
              </Link>
              <p className="text-gray-400 text-sm">
                {movieData?.release_date?.split("-")[0] || "N/A"} •
                {movieData?.genres?.[0]?.name || "Movie"}
              </p>
            </div>

            {isCurrentUser && (
              <button
                onClick={() => handleEditClick(activity)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <FaEdit className="mr-1" />
                Edit
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-4">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`text-lg ${
                    index < activity.rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                />
              ))}
              <span className="text-white font-bold ml-2">{activity.rating}/5</span>
            </div>

            <div className="flex items-center text-gray-400 text-sm">
              <FaCalendarAlt className="mr-1" />
              <span>Logged on {activity.dateLogged}</span>
            </div>
          </div>

          {/* Review Text */}
          {activity.review && (
            <div
              className="text-gray-300 text-sm line-clamp-3"
              dangerouslySetInnerHTML={{
                __html:
                  activity.review.length > 200
                    ? activity.review.substring(0, 200) + "..."
                    : activity.review,
              }}
            />
          )}

          {/* View Full Review Link */}
          <Link
            to={`/movie-page/${activity.imdbID}/${activity._id}`}
            className="text-blue-400 hover:text-blue-300 text-sm inline-block mt-2"
          >
            View full review →
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg mr-4"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-bold">
              {isCurrentUser ? "Your Activity" : `${username}'s Activity`}
            </h1>
            <p className="text-gray-400 mt-1">
              {activities.length} review{activities.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          <AnimatePresence>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  movieData={movieDetails[activity.imdbID]}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-gray-400 text-xl">
                  {isCurrentUser
                    ? "You haven't reviewed any movies yet."
                    : `${username} hasn't reviewed any movies yet.`}
                </p>
                {isCurrentUser && (
                  <Link to="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                    Discover movies to review →
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} toggleModal={() => setShowEditModal(false)}>
          <h2 className="text-2xl font-bold mb-4 text-white">Edit Review</h2>
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-gray-300 font-bold mb-2">Date Logged</label>
              <DatePicker
                selected={editForm.dateLogged}
                onChange={(date) => setEditForm((prev) => ({ ...prev, dateLogged: date }))}
                dateFormat="dd/MM/yyyy"
                className="text-white bg-gray-800 p-2 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                maxDate={new Date()}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-gray-300 font-bold mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-2xl cursor-pointer ${
                      index < editForm.rating ? "text-yellow-400" : "text-gray-600"
                    }`}
                    onClick={() => setEditForm((prev) => ({ ...prev, rating: index + 1 }))}
                  />
                ))}
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-gray-300 font-bold mb-2">Review</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg">
                <ReactQuill
                  value={editForm.review}
                  onChange={(value) => setEditForm((prev) => ({ ...prev, review: value }))}
                  theme="snow"
                  className="text-white"
                  style={{
                    backgroundColor: "#1f2937",
                    color: "white",
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ActivityPage;

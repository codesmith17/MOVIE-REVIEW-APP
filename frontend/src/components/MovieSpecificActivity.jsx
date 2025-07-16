import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaEdit, FaCalendarAlt, FaSpinner, FaArrowLeft, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modal from "./Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../styles/quill-dark.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const MovieSpecificActivity = () => {
  const { movieId, username } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.data);
  
  const [movieData, setMovieData] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    review: "",
    rating: 0,
    dateLogged: null
  });
  const [imdbID, setImdbID] = useState("");

  const isCurrentUser = user?.data?.username === username;

  useEffect(() => {
    fetchMovieAndActivity();
  }, [movieId, username]);

  const fetchMovieAndActivity = async () => {
    try {
      setLoading(true);
      
      // Fetch movie details
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        }
      );
      
      let imdb_id = "";
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        setMovieData(movieData);
        imdb_id = movieData.imdb_id;
        setImdbID(imdb_id);
      }
      if (!imdb_id) {
        setUserActivity(null);
        setLoading(false);
        return;
      }

      // Fetch user's review for this specific movie (by imdbID)
      const reviewResponse = await fetch(
        `${API_BASE_URL}/api/review/getPersonalReview/${imdb_id}?username=${username}`,
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
        setUserActivity(reviewData.review);
      } else {
        setUserActivity(null);
      }
    } catch (error) {
      console.error("Error fetching movie activity:", error);
      toast.error("Failed to fetch movie activity");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!userActivity) return;
    
    setEditForm({
      review: userActivity.review || "",
      rating: userActivity.rating || 0,
      dateLogged: userActivity.dateLogged ? new Date(userActivity.dateLogged.split("/").reverse().join("-")) : null
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formattedDate = editForm.dateLogged 
        ? `${editForm.dateLogged.getDate()}/${editForm.dateLogged.getMonth() + 1}/${editForm.dateLogged.getFullYear()}`
        : userActivity.dateLogged;

      const response = await fetch(
        `${API_BASE_URL}/api/review/updateReview/${userActivity._id}`,
        {
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
        }
      );

      if (response.ok) {
        toast.success("Review updated successfully!");
        setShowEditModal(false);
        fetchMovieAndActivity(); // Refresh the data
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const getStatusInfo = () => {
    if (userActivity) {
      return {
        icon: FaEye,
        label: "Reviewed",
        color: "bg-green-600",
        textColor: "text-green-400"
      };
    } else {
      return {
        icon: FaEye,
        label: "Not Watched",
        color: "bg-gray-600",
        textColor: "text-gray-400"
      };
    }
  };

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

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
              for {movieData?.title} ({movieData?.release_date?.split("-")[0]})
            </p>
          </div>
        </div>

        {/* Movie Info Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex gap-6">
            {/* Movie Poster */}
            <Link to={`/movie/${movieId}`} className="flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w300${movieData?.poster_path}`}
                alt={movieData?.title}
                className="w-32 h-48 object-cover rounded-lg hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />
            </Link>

            {/* Movie Details */}
            <div className="flex-1">
              <Link 
                to={`/movie/${movieId}`}
                className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
              >
                {movieData?.title}
              </Link>
              <p className="text-gray-400 mb-4">
                {movieData?.release_date?.split("-")[0]} • {movieData?.genres?.[0]?.name || "Movie"}
              </p>
              
              <p className="text-gray-300 text-sm mb-4">
                {movieData?.overview}
              </p>

              {/* Status and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Watch Status */}
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${statusInfo.color}`}>
                    <StatusIcon className="text-xl text-white" />
                  </div>
                  <div className={`text-lg font-semibold ${statusInfo.textColor}`}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center mb-3">
                    <FaStar className="text-xl text-white" />
                  </div>
                  <div className="text-lg font-semibold text-yellow-400">
                    {userActivity?.rating > 0 ? `${userActivity.rating}/5` : "Not Rated"}
                  </div>
                </div>

                {/* Date */}
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mb-3">
                    <FaCalendarAlt className="text-xl text-white" />
                  </div>
                  <div className="text-lg font-semibold text-purple-400">
                    {userActivity?.dateLogged || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Details */}
        {userActivity ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Review Details</h3>
              {isCurrentUser && (
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Review
                </button>
              )}
            </div>

            {/* Rating Display */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Rating</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-2xl ${
                      index < userActivity.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-white font-bold text-xl ml-3">{userActivity.rating}/5</span>
              </div>
            </div>

            {/* Review Text */}
            {userActivity.review && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Review</h4>
                <div 
                  className="text-gray-300 bg-gray-900 rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: userActivity.review }}
                />
              </div>
            )}

            {/* Date Logged */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Date Logged</h4>
              <p className="text-gray-300">{userActivity.dateLogged}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-8 text-center"
          >
            <p className="text-gray-400 text-xl mb-4">
              {isCurrentUser 
                ? "You haven't reviewed this movie yet." 
                : `${username} hasn't reviewed this movie yet.`
              }
            </p>
            <Link
              to={`/movie/${movieId}`}
              className="text-blue-400 hover:text-blue-300"
            >
              Go to movie page →
            </Link>
          </motion.div>
        )}

        {/* All Activity Link */}
        <div className="mt-8 text-center">
          <Link
            to={`/activity/${username}`}
            className="text-blue-400 hover:text-blue-300"
          >
            View all {isCurrentUser ? "your" : `${username}'s`} activity →
          </Link>
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
                onChange={(date) => setEditForm(prev => ({ ...prev, dateLogged: date }))}
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
                      index < editForm.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    onClick={() => setEditForm(prev => ({ ...prev, rating: index + 1 }))}
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
                  onChange={(value) => setEditForm(prev => ({ ...prev, review: value }))}
                  theme="snow"
                  className="text-white"
                  style={{ 
                    backgroundColor: '#1f2937',
                    color: 'white'
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

export default MovieSpecificActivity; 
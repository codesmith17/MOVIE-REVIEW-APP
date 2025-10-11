import React, { useState, useEffect } from "react";
import { SearchModal } from "../modals";
import {
  FaSpinner,
  FaUpload,
  FaPlus,
  FaUser,
  FaStar,
  FaList,
  FaHeart,
  FaClock,
  FaCalendarAlt,
  FaFilm,
  FaUserPlus,
  FaUserMinus,
  FaCamera,
  FaTrophy,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaInfoCircle,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import FollowedByList from "../user/FollowedByList";
import UserActivitySummary from "../user/UserActivitySummary";
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const UserPage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("reviews");
  const user = useSelector((state) => state.user.data);
  const fetchWatchlist = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/getList/${username}/watchlist`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }

      const data = await response.json();
      console.log("[Watchlist Fetch] Data:", data);
      if (data.message === "NO SUCH LIST AVAILABLE") {
        toast.info("No watchlist available");
        return;
      }
      if (data && data.data[0]) setWatchlist(data.data[0]);
      console.log(data.data[0]);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to fetch watchlist");
    }
  };

  useEffect(() => {
    if (fetchedUserData) {
      fetchWatchlist();
    }
  }, [fetchedUserData]);

  const handleSearchMovie = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search movies");
      const data = await response.json();
      setSearchResults(data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error searching movies:", error);
      toast.error("Failed to search movies");
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (movie) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/addToList/watchlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movie: {
              ...movie,
              listName: "watchlist",
            },
          }),
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to add movie to watchlist");
      await fetchWatchlist();
      toast.success("Movie added to watchlist");
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
      toast.error("Failed to add movie to watchlist");
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.data) {
      toast.error("Please log in to follow users.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/toggleFollow/${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
      toast.success(data.message);
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (user?.data && user.data.username === username) {
      setFetchedUserData(user.data);
      setFollowersCount(user.data.followers);
      setIsFollowing(false); // Can't follow yourself
      setIsLoading(false);
    } else {
      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/auth/getOthersData/${username}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          if (!response.ok) {
            if (response.status === 404) {
              setNotFound(true);
            } else {
              throw new Error("Failed to fetch user data");
            }
            setIsLoading(false);
            return;
          }
          const data = await response.json();
          if (!data || !data.data) {
            throw new Error("User data not found");
          }
          setFetchedUserData(data.data);
          setFollowersCount(data.data.followers);
          setIsFollowing(
            data.data.followers
              ? data.data.followersList.includes(user?.data?.username)
              : false
          );
        } catch (err) {
          setNotFound(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    }
  }, [username, user]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setFetchedUserData((prevData) => ({
        ...prevData,
        profilePicture: data.profilePicture,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "reviews":
        return <ReviewsTab username={username} />;
      case "watchlist":
        return (
          <WatchlistTab watchlist={watchlist} setIsModalOpen={setIsModalOpen} fetchWatchlist={fetchWatchlist} />
        );
      case "lists":
        return <ListsTab username={username} />;
      case "likes":
        return <LikesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaSpinner className="text-cyan-500 text-4xl sm:text-5xl" />
            </motion.div>
          </div>
        ) : fetchedUserData ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Hero Section with Glass Effect */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5" />
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48"
                    >
                      {fetchedUserData.profilePicture ? (
                        <img
                          src={fetchedUserData.profilePicture}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover border-2 sm:border-4 border-cyan-500 shadow-2xl ring-2 sm:ring-4 ring-cyan-500/20"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl ring-2 sm:ring-4 ring-cyan-500/20">
                          <FaUser className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white" />
                        </div>
                      )}
                      {user?.data && user.data.username === username && (
                        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-cyan-600 p-2 sm:p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                          <FaCamera className="text-white text-sm sm:text-base md:text-lg" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left w-full">
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-slate-100 to-cyan-400 bg-clip-text text-transparent break-words"
                    >
                      {fetchedUserData.username}
                    </motion.h1>

                    {user?.data && user.data.username === username && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-2 sm:mb-3"
                      >
                        <p className="text-cyan-300 text-sm sm:text-base md:text-lg break-words">
                          {fetchedUserData.email}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm italic">
                          (Only visible to you)
                        </p>
                      </motion.div>
                    )}

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 break-words"
                    >
                      {fetchedUserData.name}
                    </motion.p>

                    {/* Stats Row */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6"
                    >
                      <ModernStatBox
                        icon={FaStar}
                        label="Reviews"
                        value={fetchedUserData.reviewCount || 0}
                        color="from-yellow-400 to-orange-500"
                      />
                      <ModernStatBox
                        icon={FaHeart}
                        label="Followers"
                        value={followersCount}
                        color="from-pink-400 to-rose-500"
                      />
                      <ModernStatBox
                        icon={FaUserPlus}
                        label="Following"
                        value={fetchedUserData.following}
                        color="from-blue-400 to-cyan-500"
                      />
                    </motion.div>

                    {username !== user?.username && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs sm:text-sm text-cyan-300 mb-3 sm:mb-4"
                      >
                        <FollowedByList
                          profileUser={username}
                          currentUser={user?.data?.username}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {user?.data && user.data.username !== username && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollowToggle}
                    className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg shadow-xl transition-all duration-300 w-full sm:w-auto ${
                      isFollowing
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserMinus /> Unfollow
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Follow
                      </>
                    )}
                  </motion.button>
                )}

                {/* File Upload Section */}
                {user?.data && user.data.username === username && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto"
                  >
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-600/30">
                      <h3 className="text-base sm:text-lg font-semibold text-cyan-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <FaCamera /> Update Profile Picture
                      </h3>
                      <label
                        htmlFor="file-upload"
                        className="group flex items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed border-cyan-500/50 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            className="p-2 sm:p-3 bg-cyan-600/20 rounded-lg"
                          >
                            <FaUpload className="text-lg sm:text-xl md:text-2xl text-cyan-400" />
                          </motion.div>
                          <div className="text-left">
                            <p className="text-cyan-300 font-medium text-sm sm:text-base break-words">
                              {selectedFile ? selectedFile.name : "Choose a file"}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400">
                              {selectedFile ? "Click to change" : "PNG, JPG up to 10MB"}
                            </p>
                          </div>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className={`mt-3 sm:mt-4 w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
                          !selectedFile || isUploading
                            ? "bg-gray-600 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <FaSpinner className="animate-spin text-lg sm:text-xl" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="text-lg sm:text-xl" />
                            Upload Profile Picture
                          </>
                        )}
                      </motion.button>
                      {uploadProgress > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 sm:mt-4"
                        >
                          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-cyan-300 mt-2 text-center font-medium">
                            {uploadProgress}% Uploaded
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                <SearchModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  loading={loading}
                  handleSearchMovie={handleSearchMovie}
                  handleAddToWatchlist={handleAddToWatchlist}
                />

                {/* User Activity Summary */}
                <div className="mt-8">
                  <UserActivitySummary
                    username={username}
                    isCurrentUser={user?.data?.username === username}
                  />
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 sm:mt-8"
            >
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-gray-700/50">
                <ModernTabButton
                  icon={FaStar}
                  label="Reviews"
                  tab="reviews"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <ModernTabButton
                  icon={FaFilm}
                  label="Watchlist"
                  tab="watchlist"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <ModernTabButton
                  icon={FaList}
                  label="Lists"
                  tab="lists"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <ModernTabButton
                  icon={FaHeart}
                  label="Likes"
                  tab="likes"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>

              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : notFound ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto mt-16 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl text-center border border-gray-700/50"
          >
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-3xl font-bold text-red-400 mb-3">User Not Found</h2>
            <p className="text-gray-400 text-lg">
              The user you're looking for doesn't exist.
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
// Modern Stat Box Component with gradient and icon
const ModernStatBox = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-600/30 min-w-[100px] sm:min-w-[120px] md:min-w-[140px] shadow-xl">
      <div className={`inline-flex p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${color} mb-2 sm:mb-3`}>
        <Icon className="text-white text-base sm:text-lg md:text-xl lg:text-2xl" />
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-gray-400 font-medium">{label}</div>
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
    </div>
  </motion.div>
);

// Modern Tab Button Component
const ModernTabButton = ({ icon: Icon, label, tab, activeTab, setActiveTab }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab(tab)}
    className={`relative flex items-center gap-1.5 sm:gap-2 md:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 ${
      activeTab === tab
        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
        : "bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`}
  >
    <Icon className="text-sm sm:text-base md:text-lg lg:text-xl" />
    <span className="whitespace-nowrap">{label}</span>
    
    {/* Active indicator */}
    {activeTab === tab && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </motion.button>
);

const TabContent = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-2xl"
  >
    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
      {title}
    </h3>
    {children}
  </motion.div>
);
const ReviewsTab = ({ username }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [movieDetails, setMovieDetails] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/review/getReviews/${username}`
        );
        const data = await response.json();

        if (response.ok) {
          // console.log(data);
          setReviews(data.reviews);
        } else {
          toast.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Error fetching reviews");
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [username]);

  useEffect(() => {
    const fetchAllMovieDetails = async () => {
      const details = {};
      const fetchPromises = reviews.map(async (review) => {
        try {
          let mediaType = 'movie';
          let mediaId = review.imdbID;

          // Check if the ID has a type prefix (tv- or movie-)
          if (typeof review.imdbID === 'string') {
            if (review.imdbID.startsWith('tv-')) {
              mediaType = 'tv';
              mediaId = review.imdbID.replace('tv-', '');
            } else if (review.imdbID.startsWith('movie-')) {
              mediaType = 'movie';
              mediaId = review.imdbID.replace('movie-', '');
            }
          }

          const response = await fetch(
            `https://api.themoviedb.org/3/${mediaType}/${mediaId}?language=en-US`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            details[review.imdbID] = {
              ...data,
              mediaType, // Store the media type for later use
            };
          } else {
            console.warn(`Failed to fetch details for ${review.imdbID}`);
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
  }, [reviews, username]);

  return (
    <TabContent title="Reviews">
      {loadingReviews ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="text-cyan-500 text-4xl" />
          </motion.div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {reviews.map((review) => {
            const mediaData = movieDetails[review.imdbID];
            if (!mediaData) return null; // Skip if data hasn't loaded yet
            
            const isTV = mediaData.mediaType === 'tv';
            const title = isTV ? mediaData.name : mediaData.title;
            const releaseDate = isTV ? mediaData.first_air_date : mediaData.release_date;
            const mediaTypeLabel = isTV ? 'TV Show' : 'Movie';
            
            return (
              <Link key={review._id} to={`/movie-page/${review.imdbID}/${review._id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-600/30"
                >
                  <div className="flex items-start p-3 sm:p-4 md:p-5">
                    <div className="relative flex-shrink-0">
                      {mediaData.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${mediaData.poster_path}`}
                          alt={title}
                          className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 object-cover rounded-lg sm:rounded-xl shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 bg-gray-600 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center">
                          <FaFilm className="text-gray-400 text-xl sm:text-2xl md:text-3xl" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg sm:rounded-xl" />
                      {/* Media Type Badge */}
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-cyan-600/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 rounded text-xs text-white font-semibold">
                        {mediaTypeLabel}
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 md:ml-5 flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {title || "Unknown Title"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                        {releaseDate?.split("-")[0] || "N/A"} •{" "}
                        {mediaData.genres?.[0]?.name || mediaTypeLabel}
                      </p>
                      <div className="flex items-center mb-2 sm:mb-3 gap-1.5 sm:gap-2 flex-wrap">
                        <div className="flex items-center bg-yellow-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                          <FaStar className="text-yellow-400 mr-1 sm:mr-1.5 text-xs sm:text-sm" />
                          <span className="font-bold text-white text-xs sm:text-sm">{review.rating}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 truncate">
                          by {review.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                    <p
                      className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: review.review.substring(0, 200) + "...",
                      }}
                    />
                    <div className="flex items-center mt-2 sm:mt-3 text-xs text-gray-500">
                      <FaCalendarAlt className="mr-1.5 sm:mr-2" />
                      <span>
                        {new Date(review.dateLogged).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-gray-400">No reviews yet</p>
        </div>
      )}
    </TabContent>
  );
};

const WatchlistTab = ({ watchlist, setIsModalOpen, fetchWatchlist }) => {
  const handleRemoveFromWatchlist = async (movie, e) => {
    e.preventDefault(); // Prevent navigation when clicking remove button
    e.stopPropagation();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/removeFromList/watchlist`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imdbID: movie.imdbID || `${movie.type}-${movie.id}`,
            tmdbId: movie.id,
          }),
          credentials: "include",
        }
      );
      
      if (!response.ok) throw new Error("Failed to remove from watchlist");
      
      await fetchWatchlist();
      toast.success(`${movie.title} removed from watchlist`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove from watchlist");
    }
  };

  return (
    <TabContent title="Watchlist">
      {watchlist && watchlist.content.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {watchlist.content.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onRemove={handleRemoveFromWatchlist}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyWatchlist />
      )}
      <AddMovieButton setIsModalOpen={setIsModalOpen} />
    </TabContent>
  );
};

const MovieCard = ({ movie, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -8 }}
    transition={{ duration: 0.3 }}
    className="group relative"
  >
    <Link
      to={`/${movie.type === 'tv' ? 'tv' : 'movie'}/${movie.id}`}
      className="block"
    >
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700/50">
        {/* Poster Image */}
        <div className="relative overflow-hidden aspect-[2/3]">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.posterLink}`}
            alt={movie.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          {/* Hover Overlay with Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <FaEye className="text-cyan-300" />
                <span className="text-cyan-100 text-sm font-medium">Click to view details</span>
              </div>
            </div>
          </div>

          {/* Media Type Badge */}
          <div className="absolute top-3 left-3">
            <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cyan-500/30">
              <span className="text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                {movie.type === 'tv' ? 'TV Show' : 'Movie'}
              </span>
            </div>
          </div>

          {/* Remove Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onRemove(movie, e)}
            className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-500 backdrop-blur-sm p-2.5 rounded-lg shadow-lg transition-all duration-300 z-10 border border-red-400/30"
            title="Remove from watchlist"
          >
            <FaTimes className="text-white text-sm" />
          </motion.button>
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h4 className="font-bold text-base sm:text-lg text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {movie.title}
          </h4>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <FaCalendarAlt className="text-cyan-400" />
              <span>{movie.year}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-cyan-600/20 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              <FaClock className="text-cyan-400 text-xs" />
              <span className="text-cyan-300 text-xs font-medium">Watchlist</span>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </Link>
    
    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300 -z-10" />
  </motion.div>
);

const EmptyWatchlist = () => (
  <div className="text-center py-20">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
        className="text-8xl mb-6"
      >
        🎬
      </motion.div>
      <h3 className="text-3xl font-bold text-gray-200 mb-3">
        Your watchlist is empty
      </h3>
      <p className="text-gray-400 text-lg">
        Start adding movies and shows to keep track of what you want to watch next!
      </p>
    </motion.div>
  </div>
);

const AddMovieButton = ({ setIsModalOpen }) => (
  <div className="mt-12 text-center">
    <motion.button
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsModalOpen(true)}
      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-2xl inline-flex items-center gap-3 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
    >
      <FaPlus className="text-xl" />
      <span className="text-lg">Add to Watchlist</span>
    </motion.button>
  </div>
);

const ListsTab = ({ username }) => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listSearchLoading, setListSearchLoading] = useState(false);

  const fetchLists = async () => {
    setListSearchLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/getList/${username}/normal`
      );
      console.log("Fetch response:", response); // Debug log
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // Debug log
        if (Array.isArray(data.data)) {
          setLists(data.data);
          console.log("Lists set to:", data.data); // Debug log
        } else {
          console.error("Received data is not an array:", data.data);
          setLists([]); // Set to empty array if data is not as expected
        }
      } else {
        console.error(
          "Failed to fetch lists:",
          response.status,
          response.statusText
        );
        toast.error("Failed to fetch lists");
        setLists([]); // Set to empty array on error
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Error fetching lists");
      setLists([]); // Set to empty array on error
    } finally {
      setListSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [username]);

  const handleCreateList = async (movie) => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    if (newListName.trim().toLowerCase() === "watchlist") {
      toast.error("Cannot create a list named 'watchlist'. This name is reserved.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/addToList/normal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movie: {
              ...(movie || {}),
              listName: newListName,
            },
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(
          movie
            ? "List created with selected movie"
            : "Empty list created successfully"
        );
        setNewListName("");
        fetchLists();
      } else {
        throw new Error("Failed to create list");
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error(error.message || "Error creating list");
    }
  };

  const handleSearchMovie = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${searchQuery}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search movies and shows");
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error searching movies and shows:", error);
      toast.error("Failed to search movies and shows");
    } finally {
      setLoading(false);
    }
  };

  const onSelectMovie = (movie) => {
    handleCreateList(movie);
    setIsModalOpen(false);
    setIsCreatingList(false);
  };

  const handleAddToList = async (item) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/list/addToList/normal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: {
              ...item,
              listName: selectedList.name,
            },
          }),
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to add item to list");
      toast.success("Item added to list");
      fetchLists();
    } catch (error) {
      console.error("Error adding item to list:", error);
      toast.error("Failed to add item to list");
    }
  };

  return (
    <TabContent title="Lists">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter new list name..."
            className="flex-1 px-5 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsCreatingList(true);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaPlus /> Create List
          </motion.button>
        </div>
      </div>
      {listSearchLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="text-cyan-500 text-4xl" />
          </motion.div>
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Link
              key={list._id}
              to={`/list/${list._id}`}
              state={{ list }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm p-6 rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-600/30 relative overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <FaList className="text-3xl text-cyan-400" />
                    <div className="bg-cyan-600/20 px-3 py-1 rounded-lg">
                      <span className="text-sm text-cyan-300 font-medium">
                        {list.content.length}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {list.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">
                    {list.type === 'normal' ? 'Custom List' : list.type}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {list.content.length} {list.content.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-3xl font-bold text-gray-200 mb-3">
              No lists yet
            </h3>
            <p className="text-gray-400 text-lg">
              Create your first list to organize your favorite movies and shows!
            </p>
          </motion.div>
        </div>
      )}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsCreatingList(false);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        loading={loading}
        handleSearchMovie={handleSearchMovie}
        onSelectMovie={onSelectMovie}
        isCreatingList={isCreatingList}
      />
    </TabContent>
  );
};

const ListDetails = ({ list, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{list.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {list.content.map((movie) => (
            <div key={movie.id} className="bg-gray-100 p-2 rounded">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.posterLink}`}
                alt={movie.title}
                className="w-full h-auto mb-2"
              />
              <p className="font-semibold text-sm">{movie.title}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
const LikesTab = () => (
  <TabContent title="Likes">
    <div className="text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="text-8xl mb-6"
        >
          ❤️
        </motion.div>
        <h3 className="text-3xl font-bold text-gray-200 mb-3">
          Coming Soon
        </h3>
        <p className="text-gray-400 text-lg">
          Liked reviews and content will be displayed here.
        </p>
      </motion.div>
    </div>
  </TabContent>
);

export default UserPage;

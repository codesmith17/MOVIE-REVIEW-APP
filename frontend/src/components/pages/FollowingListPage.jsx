import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaStar,
  FaUserPlus,
  FaUserMinus,
  FaSpinner,
  FaSearch,
  FaArrowLeft,
  FaHeart,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ITEMS_PER_PAGE = 20;

const FollowingListPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.data);

  const [following, setFollowing] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchFollowing();
  }, [username]);

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/getFollowing/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
        setFilteredFollowing(data.following || []);

        // Check following status for each user
        if (user?.data) {
          const statusMap = {};
          data.following?.forEach((followedUser) => {
            statusMap[followedUser.username] = followedUser.followersList?.includes(
              user.data.username
            );
          });
          setFollowingStatus(statusMap);
        }
      } else {
        toast.error("Failed to fetch following list");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
      toast.error("Error fetching following list");
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchQuery) {
      const filtered = following.filter(
        (followedUser) =>
          followedUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          followedUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowing(filtered);
    } else {
      setFilteredFollowing(following);
    }
    setCurrentPage(1);
  }, [searchQuery, following]);

  const handleFollowToggle = async (followedUsername) => {
    if (!user?.data) {
      toast.error("Please log in to follow users");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/toggleFollow/${followedUsername}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingStatus((prev) => ({
          ...prev,
          [followedUsername]: data.isFollowing,
        }));
        toast.success(data.message);
      } else {
        toast.error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Error updating follow status");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFollowing.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFollowing = filteredFollowing.slice(startIndex, endIndex);

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
      <div className="max-w-6xl mx-auto">
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

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {username}'s Following
          </h1>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <FaUserPlus className="text-blue-400" />
            {filteredFollowing.length} {filteredFollowing.length === 1 ? "user" : "users"}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-700/50 mb-8"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search following..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>

        {/* Following Grid */}
        {currentFollowing.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence mode="popLayout">
                {currentFollowing.map((followedUser, index) => (
                  <motion.div
                    key={followedUser.username}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Link to={`/user/${followedUser.username}`} className="block">
                        <div className="flex items-center gap-4 mb-4">
                          {followedUser.profilePicture ? (
                            <img
                              src={followedUser.profilePicture}
                              alt={followedUser.username}
                              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                              <FaUser className="text-2xl text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-white truncate hover:text-cyan-300 transition-colors">
                              {followedUser.username}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">{followedUser.name}</p>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600/50">
                        <div className="flex gap-3 text-sm">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <FaStar />
                            <span>{followedUser.reviewCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <FaHeart />
                            <span>{followedUser.followers || 0}</span>
                          </div>
                        </div>

                        {user?.data && user.data.username !== followedUser.username && (
                          <button
                            onClick={() => handleFollowToggle(followedUser.username)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              followingStatus[followedUser.username]
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                            }`}
                          >
                            {followingStatus[followedUser.username] ? (
                              <>
                                <FaUserMinus className="inline mr-1" /> Unfollow
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="inline mr-1" /> Follow
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
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
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
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
            <div className="text-8xl mb-6">👥</div>
            <h3 className="text-3xl font-bold text-gray-200 mb-3">No users found</h3>
            <p className="text-gray-400 text-lg">
              {searchQuery ? "Try adjusting your search" : "This user isn't following anyone yet"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FollowingListPage;

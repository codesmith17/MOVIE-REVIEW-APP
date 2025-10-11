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
          <WatchlistTab watchlist={watchlist} setIsModalOpen={setIsModalOpen} />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 flex justify-center items-center">
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : fetchedUserData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-row justify-center items-center mb-8">
              <div className="relative w-48 h-48 mb-6">
                {fetchedUserData.profilePicture ? (
                  <img
                    src={fetchedUserData.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-blue-600 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                    <FaUser className="text-6xl text-white" />
                  </div>
                )}
              </div>
              <div className="text-center mx-10 text-white">
                <h2 className="text-4xl font-bold mb-2">
                  {fetchedUserData.username}
                </h2>
                {user?.data && user.data.username === username && (
                  <p className="text-blue-300 mb-1">
                    {fetchedUserData.email} <p>(not visible to other users)</p>
                  </p>
                )}
                <p className="text-blue-300 mb-6">
                  Name: {fetchedUserData.name}
                </p>

                <div className="flex justify-center space-x-12 mb-6">
                  <StatBox
                    label="Reviews"
                    value={fetchedUserData.reviewCount || 0}
                  />
                  <StatBox label="Followers" value={followersCount} />
                  <StatBox
                    label="Following"
                    value={fetchedUserData.following}
                  />
                </div>

                {username !== user?.username && (
                  <div className="text-sm text-blue-300 mb-6">
                    <FollowedByList
                      profileUser={username}
                      currentUser={user?.data?.username}
                    />
                  </div>
                )}
              </div>
            </div>

            {user?.data && user.data.username !== username && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollowToggle}
                className={`w-64 mx-auto block py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
                  isFollowing
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </motion.button>
            )}

            {user?.data && user.data.username === username && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 w-full max-w-md mx-auto p-6 bg-gray-700 rounded-lg"
              >
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <FaUpload className="mr-3 text-blue-400" />
                  <span className="text-blue-300">
                    {selectedFile ? selectedFile.name : "Choose a file"}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={`mt-4 w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
                    !selectedFile || isUploading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUploading ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : (
                    <FaUpload className="inline mr-2" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Profile Picture"}
                </motion.button>
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-blue-300 mt-1">
                      {uploadProgress}% Uploaded
                    </span>
                  </div>
                )}
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
            <UserActivitySummary 
              username={username} 
              isCurrentUser={user?.data?.username === username}
            />
            
            <div className="mt-12">
              <div className="flex justify-center mb-8">
                <TabButton
                  icon={FaStar}
                  label="Reviews"
                  tab="reviews"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <TabButton
                  icon={FaFilm}
                  label="Watchlist"
                  tab="watchlist"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <TabButton
                  icon={FaList}
                  label="Lists"
                  tab="lists"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <TabButton
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
            </div>
          </motion.div>
        ) : notFound ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto mt-8 bg-gray-800 p-8 rounded-lg shadow-2xl text-center"
          >
            <p className="text-2xl text-red-500">No such user found!</p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
const StatBox = ({ label, value }) => (
  <div className="text-center">
    <span className="block text-4xl font-bold">{value}</span>
    <span className="text-sm text-blue-300">{label}</span>
  </div>
);
const TabButton = ({ icon: Icon, label, tab, activeTab, setActiveTab }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab(tab)}
    className={`flex flex-col items-center p-4 mx-2 rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : "text-blue-300 hover:bg-gray-700"
    }`}
  >
    <Icon className="text-2xl mb-2" />
    <span className="text-sm">{label}</span>
  </motion.button>
);

const TabContent = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-700 p-6 rounded-lg"
  >
    <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
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
      await Promise.all(
        reviews.map(async (review) => {
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
          if (!response.ok) {
            toast.error(`ERROR FETCHING ${username} REVIEWS`);
            return;
          }
          const movieData = await response.json();
          console.log(movieData);
          details[review.imdbID] = movieData;
        })
      );
      setMovieDetails(details);
    };

    if (reviews.length > 0) {
      fetchAllMovieDetails();
    }
  }, [reviews]);

  return (
    <TabContent title="Reviews">
      {loadingReviews ? (
        <div className="flex justify-center">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => {
            const movieData = movieDetails[review.imdbID];
            return (
              <Link to={`/movie-page/${review.imdbID}/${review._id}`}>
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movieData?.poster_path}`}
                      alt={movieData?.title}
                      className="w-24 h-36 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {movieData?.title || "Unknown Title"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {movieData?.release_date?.split("-")[0] || "N/A"} •{" "}
                        {movieData?.genres?.[0]?.name || "Movie"}
                      </p>
                      <div className="flex items-center mb-2">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-bold">{review.rating}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          by {review.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p
                    className="mt-3 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: review.review.substring(0, 200) + "...",
                    }}
                  />
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <FaCalendarAlt className="mr-1" />
                    <span>
                      Logged on{" "}
                      {new Date(review.dateLogged).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No reviews found.
        </p>
      )}
    </TabContent>
  );
};

const WatchlistTab = ({ watchlist, setIsModalOpen }) => {
  return (
    <TabContent title="Watchlist">
      {watchlist && watchlist.content.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {watchlist.content.map((movie) => (
            <Link
              key={movie.id}
              to={`/${movie.type === 'tv' ? 'tv' : 'movie'}/${movie.id}`}
            >
              <MovieCard movie={movie} />
            </Link>
          ))}
        </motion.div>
      ) : (
        <EmptyWatchlist />
      )}
      <AddMovieButton setIsModalOpen={setIsModalOpen} />
    </TabContent>
  );
};

const MovieCard = ({ movie }) => (
  <div className="group block">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.posterLink}`}
          alt={movie.title}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="font-bold text-xl text-white mb-1 line-clamp-2">
            {movie.title}
          </h4>
          <p className="text-gray-300 text-sm">{movie.year}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-blue-400">
          <FaClock className="mr-2" />
          <span className="text-sm font-medium">On your watchlist</span>
        </div>
      </div>
    </motion.div>
  </div>
);

const EmptyWatchlist = () => (
  <div className="text-center py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FaClock className="text-gray-400 text-6xl mb-4 mx-auto" />
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Your watchlist is empty
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Start adding movies to your watchlist and keep track of what you want to
        watch next!
      </p>
    </motion.div>
  </div>
);

const AddMovieButton = ({ setIsModalOpen }) => (
  <div className="mt-12 text-center">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsModalOpen(true)}
      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition duration-300"
    >
      <FaPlus />
      <span>Add Movie to Watchlist</span>
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
      <div className="mb-6">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter new list name"
          className="p-2 border rounded mr-2"
        />
        <button
          onClick={() => {
            setIsCreatingList(true);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create List
        </button>
      </div>
      {listSearchLoading ? (
        <p>Loading lists...</p>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <Link
              key={list._id}
              to={`/list/${list._id}`}
              state={{ list }}
              className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              <h3 className="text-xl font-bold mb-2">{list.name}</h3>
              <p className="text-gray-600 mb-1">{list.type ? list.type : 'Custom List'}</p>
              <p>{list.content.length} movies</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No lists found. Create your first list!</p>
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
    <p className="text-gray-600 dark:text-gray-400">
      User's liked movies will be displayed here.
    </p>
  </TabContent>
);

export default UserPage;

import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaUpload,
  FaUser,
  FaStar,
  FaList,
  FaHeart,
  FaCalendarAlt,
  FaFilm,
} from "react-icons/fa";

import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const UserPage = () => {
  const { username } = useParams();
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

  const handleFollowToggle = async () => {
    if (!user?.data) {
      toast.error("Please log in to follow users.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/toggleFollow/${username}`,
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
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/auth/getOthersData/${username}`,
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
        console.log(user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.data && user.data.username === username) {
      setFetchedUserData(user.data);
      setFollowersCount(user.data.followers);
    } else {
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
        "http://localhost:3000/api/auth/upload-profile-picture",
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
        profilePicture: data.profilePictureUrl,
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
        return <WatchlistTab />;
      case "lists":
        return <ListsTab />;
      case "likes":
        return <LikesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111827] dark:bg-gray-900 p-4">
      {isLoading ? (
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      ) : fetchedUserData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-gray-800 dark:text-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="relative w-32 h-32 mb-4 md:mb-0 md:mr-6">
              {fetchedUserData.profilePicture ? (
                <img
                  src={fetchedUserData.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaUser className="text-4xl text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{fetchedUserData.username}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {fetchedUserData.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Name: {fetchedUserData.name}
              </p>
              <div className="flex justify-center md:justify-start mt-2 space-x-4">
                <span>{followersCount} Followers</span>
                <span>{fetchedUserData.following} Following</span>
              </div>
            </div>
          </div>

          {user?.data && user.data.username !== username && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollowToggle}
              className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
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
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
              >
                <FaUpload className="mr-2" />
                <span>
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
                className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                  !selectedFile || isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600"
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
                  <div className="w-full bg-gray-                  bg-gray-600 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}% Uploaded
                  </span>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-8">
            <div className="flex justify-around mb-4">
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
            {renderTabContent()}
          </div>
        </motion.div>
      ) : notFound ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-800 dark:text-gray-200"
        >
          <p className="text-2xl text-red-500">No such user found!</p>
        </motion.div>
      ) : null}
    </div>
  );
};

const TabButton = ({ icon: Icon, label, tab, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-indigo-500 text-white"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    <Icon className="text-xl mb-1" />
    <span>{label}</span>
  </button>
);

const TabContent = ({ title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    {children}
  </div>
);

const ReviewsTab = ({ username }) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [movieDetails, setMovieDetails] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/review/getReviews/${username}`
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
                Authorization:
                  "bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
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

const WatchlistTab = () => (
  <TabContent title="Watchlist">
    <p className="text-gray-600 dark:text-gray-400">
      User's watchlist will be displayed here.
    </p>
  </TabContent>
);

const ListsTab = () => (
  <TabContent title="Lists">
    <p className="text-gray-600 dark:text-gray-400">
      User's lists will be displayed here.
    </p>
  </TabContent>
);

const LikesTab = () => (
  <TabContent title="Likes">
    <p className="text-gray-600 dark:text-gray-400">
      User's liked movies will be displayed here.
    </p>
  </TabContent>
);

export default UserPage;

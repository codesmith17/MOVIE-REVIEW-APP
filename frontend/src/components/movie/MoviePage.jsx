import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaPlus,
  FaStar,
  FaCheck,
  FaMinus,
  FaEdit,
  FaCalendarAlt,
  FaThumbsUp,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { OtherReviews } from "../reviews";
import {
  StarRating,
  ReadOnlyStarRating,
  ActorCard,
  NotFound,
  MovieLoader,
} from "../common";
import MovieVideos from "./MovieVideos";
import WatchProviders from "./WatchProviders";
import MovieCard from "./MovieCard";
import { WriteReviewModal } from "../modals";
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MoviePage = () => {
  const male_image =
    "https://w7.pngwing.com/pngs/328/335/png-transparent-icon-user-male-avatar-business-person-profile.png";
  const female_image =
    "https://w7.pngwing.com/pngs/869/174/png-transparent-icon-user-female-avatar-business-person-profile-thumbnail.png";
  const navigate = useNavigate();
  const location = useLocation();
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-8"></div>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
        <div className="w-full max-w-xs md:w-1/4 h-96 bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-6">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-16">
        <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
        <div className="flex flex-wrap justify-center gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-32">
              <div className="w-32 h-32 bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const [videos, setVideos] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const { mediaType, id } = useParams();
  const [dateLogged, setDateLogged] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [starRatingTemp, setStarRatingTemp] = useState(0);
  const [singleMovieData, setSingleMovieData] = useState({});
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [personalReview, setPersonalReview] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [otherReviews, setOtherReviews] = useState([]);
  const [currentReviewID, setCurrentReviewID] = useState("");
  const [imdbID, setImdbID] = useState("");
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  // const { user } = useContext(UserContext);
  const user = useSelector((state) => state.user.data);
  console.log("user", user);
  console.log("imdbID:", imdbID);
  console.log("singleMovieData:", singleMovieData);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  // Refs and state for dynamic blur
  const castScrollRef = useRef(null);
  const crewScrollRef = useRef(null);
  const recommendationsScrollRef = useRef(null);
  const [castBlur, setCastBlur] = useState({ left: false, right: true });
  const [crewBlur, setCrewBlur] = useState({ left: false, right: true });
  const [recommendationsBlur, setRecommendationsBlur] = useState({
    left: false,
    right: true,
  });

  // Handle scroll for dynamic blur
  const handleScrollBlur = (ref, setBlur) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setBlur({
      left: scrollLeft > 10,
      right: scrollLeft < scrollWidth - clientWidth - 10,
    });
  };

  // Reset all movie-specific states when navigating to a different movie
  useEffect(() => {
    // Scroll to top of page
    window.scrollTo(0, 0);

    // Reset all states
    setStarRating(0);
    setStarRatingTemp(0);
    setReview("");
    setDateLogged(null);
    setPersonalReview(null);
    setLikes(0);
    setUserHasLiked(false);
    setOtherReviews([]);
    setCurrentReviewID("");
    setImdbID("");
    setIsInWatchlist(false);
    setIsWatchlistLoading(true); // Reset loading state
    setShowModal(false);
    setIsEditorExpanded(false);
  }, [mediaType, id]);

  const fetchPersonalReview = () => {
    fetch(`${API_BASE_URL}/api/review/getPersonalReview/${imdbID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            fetchOtherReviews("");
            return;
          } else {
            fetchOtherReviews("");
            return;
          }
        } else {
          if (res.status === 204) {
            fetchOtherReviews("");
            return;
          }
        }
        return res.json();
      })
      .then((res) => {
        if (res?.message === "NO REVIEW FOUND") {
          setPersonalReview(null);
          setStarRating(0);
          setStarRatingTemp(0);
        } else {
          setPersonalReview(res.review);
          setCurrentReviewID(res.review._id);
          setStarRating(res.review.rating);
          setStarRatingTemp(res.review.rating);
          fetchOtherReviews(res.review._id);
        }
      })
      .catch((err) => {
        console.log(err);
        setPersonalReview(null);
      });
  };

  const handleRatingChange = async (rating) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/upsertRating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          dateLogged: new Date(),
          review: "",
          imdbID,
        }),
      });

      const data = await response.json();

      if (response.status === 400) {
        toast.error("Failed to update rating. Please login to rate");
        navigate("/login");
        return;
      }

      if (response.status === 401) {
        toast.error("You are unauthorized");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to update rating");
      }

      setStarRating(rating);
      toast.success("Rating updated successfully!");

      // Optionally, you can update other state or trigger a re-fetch of reviews here
      // For example:
      // fetchReviews();
      // or
      // setUserReview(prevReview => ({ ...prevReview, rating }));
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error(
        "An error occurred while updating the rating. Please try again.",
      );
    }
  };
  const fetchCastData = useCallback(() => {
    if (mediaType && id) {
      const url = `https://api.themoviedb.org/3/${mediaType}/${id}/credits?language=en-US`;
      fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCast(data.cast.slice(0, 10));
          setCrew(data.crew.slice(0, 10));
        })
        .catch((err) => console.error("Error fetching cast:", err));
    }
  }, [mediaType, id]);

  const fetchLikes = useCallback(() => {
    if (!imdbID) return;

    fetch(`${API_BASE_URL}/api/movie/getLikes/${imdbID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setLikes(data.likes || 0);
        setUserHasLiked(data.liked || false);
      })
      .catch((err) => {
        console.error("Error fetching likes:", err);
        // Set default values on error
        setLikes(0);
        setUserHasLiked(false);
      });
  }, [imdbID]);

  useEffect(() => {
    fetchCastData();
  }, [fetchCastData]);
  useEffect(() => {
    const fetchMovieData = () => {
      if (!mediaType || !id) return;
      const url = `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US`;
      fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        },
      })
        .then((response) => response.json())
        .then(async (res) => {
          // For TV shows, use TMDB ID with 'tv-' prefix since they don't have IMDB IDs
          // For movies, use IMDB ID if available, otherwise use TMDB ID with 'movie-' prefix
          const uniqueId = res.imdb_id || `${mediaType}-${id}`;
          setImdbID(uniqueId);
          await setSingleMovieData(res);
          setLoading(false);
          fetchVideos();
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    const fetchOtherReviews = (reviewID) => {
      fetch(
        `${API_BASE_URL}/api/review/getOtherReviews/${imdbID}/${reviewID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((res) => {
          if (res.status === 204) return;
          return res.json();
        })
        .then((data) => {
          if (data) setOtherReviews(data.reviews);
        })
        .catch((err) => {
          console.error("Error fetching other reviews:", err);
        });
    };

    const fetchWatchProviders = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
            },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch watch providers");
        const data = await response.json();
        setWatchProviders(data.results);
      } catch (err) {
        console.error("Error fetching watch providers:", err);
      }
    };
    const fetchVideos = async () => {
      setVideoLoading(true);
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?language=en-US`;
        fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setVideos(data.results || []);
            setVideoLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching videos:", err);
            setVideoLoading(false);
          });
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideoLoading(false);
      }
    };
    fetchMovieData();
    fetchWatchProviders();
    // if (imdbID) getRating();
    // fetchVideos();
  }, [mediaType, id]);

  // Setup scroll listeners for dynamic blur
  useEffect(() => {
    const castContainer = castScrollRef.current;
    const crewContainer = crewScrollRef.current;
    const recsContainer = recommendationsScrollRef.current;

    const castHandler = () => handleScrollBlur(castScrollRef, setCastBlur);
    const crewHandler = () => handleScrollBlur(crewScrollRef, setCrewBlur);
    const recsHandler = () =>
      handleScrollBlur(recommendationsScrollRef, setRecommendationsBlur);

    if (castContainer) {
      castHandler(); // Initial check
      castContainer.addEventListener("scroll", castHandler);
    }
    if (crewContainer) {
      crewHandler(); // Initial check
      crewContainer.addEventListener("scroll", crewHandler);
    }
    if (recsContainer) {
      recsHandler(); // Initial check
      recsContainer.addEventListener("scroll", recsHandler);
    }

    return () => {
      if (castContainer)
        castContainer.removeEventListener("scroll", castHandler);
      if (crewContainer)
        crewContainer.removeEventListener("scroll", crewHandler);
      if (recsContainer)
        recsContainer.removeEventListener("scroll", recsHandler);
    };
  }, [cast, crew, recommendations]);

  // Add this useEffect to fetch personal review only when imdbID is set
  useEffect(() => {
    if (imdbID) {
      fetchPersonalReview();
      fetchLikes();
    }
    // eslint-disable-next-line
  }, [imdbID, fetchLikes]);

  useEffect(() => {
    const getRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${id}/recommendations?language=en-US&page=1`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendations(data.results || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    getRecommendations();
  }, [mediaType, id]);

  // Check if movie is in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      const username = user?.username || user?.data?.username;
      if (!username || !singleMovieData?.id) {
        setIsWatchlistLoading(false);
        return;
      }
      try {
        setIsWatchlistLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/list/getList/${username}/watchlist`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        if (!response.ok) {
          setIsWatchlistLoading(false);
          return;
        }
        const data = await response.json();
        if (data && data.data && data.data[0]) {
          // Check by both imdbID and id for backward compatibility
          const found = data.data[0].content.some(
            (item) =>
              (item.imdbID && item.imdbID === imdbID) ||
              (item.id && item.id.toString() === singleMovieData.id.toString()),
          );
          setIsInWatchlist(found);
        }
      } catch (err) {
        // fail silently
      } finally {
        setIsWatchlistLoading(false);
      }
    };
    checkWatchlist();
  }, [user, imdbID, singleMovieData]);

  const handleAddToWatchlist = async () => {
    const username = user?.username || user?.data?.username;
    if (!username) {
      toast.error("Please log in to manage watchlist.");
      return;
    }

    try {
      if (isInWatchlist) {
        // Remove from watchlist - send both imdbID and TMDB id for backward compatibility
        const response = await fetch(
          `${API_BASE_URL}/api/list/removeFromList/watchlist`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              imdbID: imdbID || `movie-${singleMovieData?.id}`,
              tmdbId: singleMovieData?.id,
            }),
          },
        );
        if (!response.ok) throw new Error("Failed to remove from watchlist");
        setIsInWatchlist(false);
        toast.success("Removed from watchlist!");
      } else {
        // Add to watchlist
        const movieObj = {
          id: singleMovieData?.id,
          posterLink: singleMovieData?.poster_path,
          title: singleMovieData?.title || singleMovieData?.name,
          imdbID: imdbID,
        };
        const response = await fetch(
          `${API_BASE_URL}/api/list/addToList/watchlist`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ movie: movieObj }),
          },
        );
        if (!response.ok) throw new Error("Failed to add to watchlist");
        setIsInWatchlist(true);
        toast.success("Added to watchlist!");
      }
    } catch (err) {
      toast.error(
        isInWatchlist
          ? "Failed to remove from watchlist"
          : "Failed to add to watchlist",
      );
      console.error("Watchlist error:", err);
    }
  };

  const toggleModal = () => {
    fetch(`${API_BASE_URL}/api/auth/verify/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res) {
          console.log(res);
          if (res.status === 401) {
            toast.error(
              "UNAUTHORIZED, LOGIN WITH YOUR CREDENTIALS TO LOG, REVIEW OR RATE.",
            );
            navigate("/login");
            throw new Error("Failed to open Write Review modal");
          } else {
            if (!showModal) {
              // Opening modal - populate with existing review data if available
              if (personalReview) {
                setReview(personalReview.review);
                setStarRatingTemp(personalReview.rating);
                // Parse the date from personalReview.dateLogged (format: DD/MM/YYYY)
                const [day, month, year] = personalReview.dateLogged.split("/");
                setDateLogged(new Date(year, month - 1, day));
                setIsEditorExpanded(true); // Expand editor for editing
              } else {
                setDateLogged(new Date());
                setIsEditorExpanded(false);
              }
            }
            setShowModal(!showModal);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const handleReviewSubmit = () => {
    const username = user?.username || user?.data?.username;
    if (!username) {
      toast.error("Please log in to submit a review.");
      navigate("/login");
      return;
    }
    if (!imdbID) {
      toast.error("imdbID NOT AVAILABLE!!");
      return;
    }
    if (!dateLogged) {
      toast.error("PLEASE ENTER DATE!!!");
      return;
    }
    const date = new Date(dateLogged);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    const isEditing = personalReview && personalReview._id;
    const url = isEditing
      ? `${API_BASE_URL}/api/review/updateReview/${personalReview._id}`
      : `${API_BASE_URL}/api/review/postReview`;
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        review,
        imdbID,
        username: username,
        rating: starRatingTemp,
        likes: personalReview?.likes || 0,
        dateLogged: formattedDate,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            isEditing ? "Failed to update review." : "Failed to post review.",
          );
        }
        return res.json();
      })
      .then((res) => {
        const successMessage = isEditing
          ? "Review updated successfully."
          : "Review posted successfully.";
        if (
          res.message === successMessage ||
          res.message === "Review posted successfully."
        ) {
          toast.success(
            isEditing
              ? "YOUR REVIEW HAS BEEN UPDATED"
              : "YOUR REVIEW HAS BEEN POSTED",
          );
          const updatedReview = {
            ...(res.review || res.updatedReview),
            review,
            rating: starRatingTemp,
            dateLogged: formattedDate,
          };
          setPersonalReview(updatedReview);
          setShowModal(false);
          // Navigate to the SingleReview page with imdbID and reviewID
          const reviewId =
            (res.review && res.review._id) ||
            (res.updatedReview && res.updatedReview._id) ||
            personalReview._id;
          if (reviewId) {
            navigate(`/movie-page/${imdbID}/${reviewId}`);
          } else {
            // Fallback: just reload the current page
            window.location.reload();
          }
        } else {
          toast.error(res.message);
        }
      })
      .catch((err) => {
        console.error("Review submit error:", err);
        toast.error(
          isEditing ? "Failed to update review." : "Failed to post review.",
        );
      });
  };

  const handleLikeClick = async () => {
    const username = user?.username || user?.data?.username;
    if (!username) {
      handleLoginRedirect();
      return;
    }

    // Prevent double-clicking while loading
    if (likesLoading) return;

    // Optimistic UI update
    setLikesLoading(true);
    const previousLikes = likes;
    const previousLiked = userHasLiked;

    // Update UI immediately for better UX
    setUserHasLiked(!userHasLiked);
    setLikes(userHasLiked ? likes - 1 : likes + 1);

    try {
      const res = await fetch(`${API_BASE_URL}/api/movie/postLikes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imdbID }),
      });
      const data = await res.json();
      if (data.message === "UNAUTHORIZED, LOGIN AGAIN WITH YOUR CREDENTIALS") {
        // Revert optimistic update
        setUserHasLiked(previousLiked);
        setLikes(previousLikes);
        toast.error("Please log in to like movies.");
        navigate("/login");
        return;
      }
      // Fetch actual state from backend to ensure consistency
      fetchLikes();
    } catch (err) {
      // Revert optimistic update on error
      setUserHasLiked(previousLiked);
      setLikes(previousLikes);
      toast.error("Failed to like/unlike movie.");
    } finally {
      setLikesLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setDateLogged(date);
  };

  // Handler for login redirect
  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", location.pathname);
    toast.info("Please log in to write a review.");
    navigate("/login");
  };

  if (singleMovieData?.success === false) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-gray-100">
      {/* Backdrop Image with Enhanced Overlay */}
      {singleMovieData.backdrop_path && (
        <div className="fixed top-0 left-0 w-full h-[60vh] -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${singleMovieData.backdrop_path})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/70 via-[#0a0e27]/90 to-[#0a0e27]" />
        </div>
      )}

      {/* Main Content */}
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <MovieLoader />
          ) : (
            <>
              {/* Movie Info Card */}
              <div className="flex flex-col lg:flex-row gap-10 mb-16 fade-in">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${singleMovieData?.poster_path}`}
                    alt={singleMovieData.title || singleMovieData.name}
                    loading="eager"
                    className="w-64 lg:w-72 rounded-xl shadow-2xl object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {singleMovieData?.title || singleMovieData?.name}
                    </h1>
                    <p className="text-lg text-gray-400">
                      {(
                        singleMovieData?.release_date ||
                        singleMovieData?.first_air_date ||
                        ""
                      ).slice(0, 4)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {singleMovieData?.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800/60 text-gray-300 rounded-lg text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                    {singleMovieData.vote_average && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium flex items-center gap-1">
                        <FaStar className="text-xs" />
                        {singleMovieData.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                    {mediaType === "tv" && (
                      <>
                        {singleMovieData.number_of_seasons && (
                          <span>
                            {singleMovieData.number_of_seasons} Seasons
                          </span>
                        )}
                        {singleMovieData.number_of_episodes && (
                          <span>
                            • {singleMovieData.number_of_episodes} Episodes
                          </span>
                        )}
                        {singleMovieData.episode_run_time &&
                          singleMovieData.episode_run_time.length > 0 && (
                            <span>
                              • {singleMovieData.episode_run_time[0]} min
                            </span>
                          )}
                      </>
                    )}
                    {mediaType === "movie" && singleMovieData.runtime && (
                      <span>{singleMovieData.runtime} min</span>
                    )}
                    {singleMovieData.status && (
                      <span>• {singleMovieData.status}</span>
                    )}
                  </div>

                  {/* Overview */}
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">
                      Overview
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                      {singleMovieData.overview}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={handleLikeClick}
                      disabled={likesLoading}
                      className={`flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-800 rounded-lg transition-colors ${
                        likesLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {likesLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <FaHeart
                          className={`transition-colors ${
                            userHasLiked ? "text-pink-500" : "text-gray-400"
                          }`}
                        />
                      )}
                      <span className="text-sm text-gray-300">{likes}</span>
                    </button>

                    {/* Watchlist Button */}
                    {(user?.username || user?.data?.username) && (
                      <button
                        disabled={isWatchlistLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                          isWatchlistLoading
                            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            : isInWatchlist
                              ? "bg-green-600/20 text-green-400 hover:bg-red-600/20 hover:text-red-400"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                        onClick={handleAddToWatchlist}
                      >
                        {isWatchlistLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </>
                        ) : isInWatchlist ? (
                          <>
                            <FaCheck className="text-xs" />
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <FaPlus className="text-xs" />
                            <span>Add to Watchlist</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Review Button */}
                    {user?.username || user?.data?.username ? (
                      <button
                        className="px-4 py-2 bg-gray-800/60 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
                        onClick={toggleModal}
                      >
                        Write a Review
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                        onClick={handleLoginRedirect}
                      >
                        Sign in to Review
                      </button>
                    )}
                  </div>

                  {/* Star Rating */}
                  {(user?.username || user?.data?.username) && (
                    <div className="flex items-center gap-4">
                      <StarRating
                        value={starRating}
                        onRatingChange={handleRatingChange}
                      />
                      <span className="text-sm text-gray-400">
                        {starRating > 0
                          ? `Your rating: ${starRating}/5`
                          : "Rate this"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections with proper spacing */}
              <div className="space-y-16">
                {videos.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Videos
                    </h2>
                    <MovieVideos videos={videos} />
                  </div>
                )}

                {cast.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
                    <div className="relative">
                      <div
                        ref={castScrollRef}
                        className="flex gap-5 overflow-x-scroll pb-4 scroll-smooth"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#3b82f6 #1f2937",
                        }}
                      >
                        {cast.map((actor, index) => (
                          <div
                            key={actor.id + "-" + (actor.name || index)}
                            className="flex-shrink-0"
                          >
                            <ActorCard
                              id={actor.id}
                              name={actor.name}
                              profilePath={actor.profile_path}
                              character={actor.character}
                              gender={actor.gender}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Dynamic gradient fades */}
                      {castBlur.left && (
                        <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                      {castBlur.right && (
                        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                    </div>
                  </div>
                )}

                {crew.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Crew</h2>
                    <div className="relative">
                      <div
                        ref={crewScrollRef}
                        className="flex gap-5 overflow-x-scroll pb-4 scroll-smooth"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#3b82f6 #1f2937",
                        }}
                      >
                        {crew.map((crewMember, index) => (
                          <Link
                            to={`/celebrity/${crewMember.id}`}
                            key={
                              crewMember.id +
                              "-" +
                              (crewMember.job || crewMember.name || "") +
                              "-" +
                              index
                            }
                          >
                            <div className="w-32 text-center flex-shrink-0">
                              <img
                                src={`https://image.tmdb.org/t/p/w185${crewMember.profile_path}`}
                                alt={crewMember.name}
                                loading="lazy"
                                className="w-32 h-32 rounded-lg object-cover mx-auto mb-2"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    crewMember.gender === 1
                                      ? female_image
                                      : male_image;
                                }}
                              />
                              <p className="font-semibold text-sm text-white">
                                {crewMember.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {crewMember.job}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {/* Dynamic gradient fades */}
                      {crewBlur.left && (
                        <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                      {crewBlur.right && (
                        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Where to Watch
                  </h2>
                  <WatchProviders providers={watchProviders} />
                </div>

                {/* Your Activity Section */}
                {personalReview && (user?.username || user?.data?.username) && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Your Activity
                    </h2>
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <FaThumbsUp className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              Your Review
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-400 text-sm" />
                                <span className="text-gray-300 text-sm font-semibold">
                                  {personalReview.rating}/5
                                </span>
                              </div>
                              <span className="text-gray-500">•</span>
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400 text-xs" />
                                <span className="text-gray-400 text-sm">
                                  {personalReview.dateLogged}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={toggleModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <FaEdit />
                            <span>Edit</span>
                          </button>
                          <Link
                            to={`/movie-page/${imdbID}/${personalReview._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            View Full Review
                          </Link>
                        </div>
                      </div>
                      <div
                        className="prose prose-invert max-w-none text-gray-300 line-clamp-3 ql-editor"
                        dangerouslySetInnerHTML={{
                          __html: personalReview.review,
                        }}
                      />
                    </div>
                  </div>
                )}

                {otherReviews && otherReviews.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {personalReview &&
                      (user?.username || user?.data?.username)
                        ? "Reviews from Others"
                        : "Reviews"}
                    </h2>
                    <OtherReviews reviews={otherReviews} />
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      You Might Also Like
                    </h2>
                    <div className="relative">
                      <div
                        ref={recommendationsScrollRef}
                        className="flex gap-5 overflow-x-scroll pb-4 scroll-smooth"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#3b82f6 #1f2937",
                        }}
                      >
                        {loadingRecommendations
                          ? Array(4)
                              .fill()
                              .map((_, index) => (
                                <div
                                  key={index}
                                  className="w-56 h-80 bg-gray-800 rounded-lg animate-pulse flex-shrink-0"
                                ></div>
                              ))
                          : recommendations.slice(0, 12).map((movie, index) => (
                              <div
                                key={
                                  movie.id + "-" + (movie.media_type || index)
                                }
                                className="flex-shrink-0"
                              >
                                <MovieCard
                                  id={movie.id}
                                  title={movie.title || movie.name}
                                  image={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                  year={new Date(
                                    movie.release_date || movie.first_air_date,
                                  ).getFullYear()}
                                  type={mediaType === "tv" ? "tv" : "movie"}
                                  rating={movie.vote_average}
                                  loading="lazy"
                                />
                              </div>
                            ))}
                      </div>
                      {/* Dynamic gradient fades */}
                      {recommendationsBlur.left && (
                        <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                      {recommendationsBlur.right && (
                        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#0a0e27] to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <WriteReviewModal
        isOpen={showModal}
        onClose={toggleModal}
        singleMovieData={singleMovieData}
        starRatingTemp={starRatingTemp}
        setStarRatingTemp={setStarRatingTemp}
        dateLogged={dateLogged}
        setDateLogged={setDateLogged}
        review={review}
        setReview={setReview}
        isEditorExpanded={isEditorExpanded}
        setIsEditorExpanded={setIsEditorExpanded}
        handleReviewSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MoviePage;

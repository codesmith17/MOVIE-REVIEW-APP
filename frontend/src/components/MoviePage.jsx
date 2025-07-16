import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { FaHeart, FaPlus } from "react-icons/fa";
import OtherReviews from "./OtherReviews";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaStar, FaFilm, FaPlay } from "react-icons/fa";
import StarRating from "./StarRating.jsx";
import ReadOnlyStarRating from "./ReadOnlyStarRating.jsx";
import MovieVideos from "./MovieVideos.jsx";
import WatchProviders from "./WatchProviders.jsx";
// import { useContext } from "react";
// import { UserContext } from "./UserContext";
import { useSelector } from "react-redux";
import Modal from "./Modal.jsx";
import MovieCard from "./MovieCard.jsx";
import NotFound from "./NotFound.jsx";
import ActorCard from "./ActorCard.jsx";
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
  const [otherReviews, setOtherReviews] = useState([]);
  const [currentReviewID, setCurrentReviewID] = useState("");
  const [imdbID, setImdbID] = useState("");
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  // const { user } = useContext(UserContext);
  const user = useSelector((state) => state.user.data);
  console.log("user", user);
  console.log('imdbID:', imdbID);
console.log('singleMovieData:', singleMovieData);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

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
      const response = await fetch(
        `${API_BASE_URL}/api/review/upsertRating`,
        {
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
        }
      );

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
        "An error occurred while updating the rating. Please try again."
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
          setImdbID(res.imdb_id);
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
        }
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
          }
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
      if (!user?.data?.username || !imdbID) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/list/getList/${user.data.username}/watchlist`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.data && data.data[0]) {
          const found = data.data[0].content.some(
            (item) => item.imdbID === imdbID
          );
          setIsInWatchlist(found);
        }
      } catch (err) {
        // fail silently
      }
    };
    checkWatchlist();
  }, [user, imdbID]);

  const handleAddToWatchlist = async () => {
    if (!user?.data?.username) {
      toast.error("Please log in to add to watchlist.");
      return;
    }
    try {
      const movieObj = {
        id: singleMovieData?.id,
        posterLink: singleMovieData?.poster_path,
        title: singleMovieData?.title || singleMovieData?.name,
      };
      console.log("[AddToWatchlist] Sending movie object:", movieObj);
      const response = await fetch(
        `${API_BASE_URL}/api/list/addToList/watchlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ movie: movieObj }),
        }
      );
      const respData = await response.json();
      console.log("[AddToWatchlist] Response:", respData);
      if (!response.ok) throw new Error("Failed to add to watchlist");
      setIsInWatchlist(true);
      toast.success("Added to watchlist!");
    } catch (err) {
      toast.error("Failed to add to watchlist");
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
              "UNAUTHORIZED, LOGIN WITH YOUR CREDENTIALS TO LOG, REVIEW OR RATE."
            );
            navigate("/login");
            throw new Error("Failed to open Write Review modal");
          } else {
            setShowModal(!showModal);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const handleReviewSubmit = () => {
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

    fetch(`${API_BASE_URL}/api/review/postReview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        review,
        imdbID,
        username: user.data.username,
        rating: starRatingTemp,
        likes: 0,
        dateLogged: formattedDate,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to post review.");
        }
        return res.json();
      })
      .then((res) => {
        if (res.message === "Review posted successfully.") {
          toast.success("YOUR REVIEW HAS BEEN POSTED");
          setPersonalReview({
            review,
            rating: starRatingTemp,
            dateLogged: formattedDate,
          });
          setShowModal(false);
          navigate(`/movie-page/${imdbID}`);
        } else {
          toast.error(res.message);
        }
      })
      .catch((err) => {
        console.error("Review post error:", err);
        toast.error("Failed to post review.");
      });
  };

  const handleLikeClick = async () => {
    if (!user || !user.data || !user.data.username) {
      handleLoginRedirect();
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/movie/postLikes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imdbID }),
      });
      const data = await res.json();
      if (data.message === "UNAUTHORIZED, LOGIN AGAIN WITH YOUR CREDENTIALS") {
        toast.error("Please log in to like movies.");
        navigate("/login");
        return;
      }
      // Always fetch the latest like state from backend
      fetchLikes();
    } catch (err) {
      toast.error("Failed to like/unlike movie.");
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
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-gray-100 min-h-screen relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${singleMovieData.backdrop_path})`,
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-900 to-gray-900 pointer-events-none" style={{ zIndex: 1 }}></div>
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start bg-white/10 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md">
            <img
              src={`https://image.tmdb.org/t/p/w500${singleMovieData?.poster_path}`}
              alt={singleMovieData.title || singleMovieData.name}
              className="w-64 h-auto rounded-xl shadow-lg mb-6 md:mb-0 flex-shrink-0 object-cover border-4 border-white/20"
            />
            <div className="flex-1 flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-2">
                {singleMovieData?.title || singleMovieData?.name}
                <span className="text-gray-300 font-bold ml-2">
                  ({(singleMovieData?.release_date || singleMovieData?.first_air_date || "").slice(0, 4)})
                </span>
              </h1>
              <div className="flex flex-wrap gap-3 mb-2">
                {singleMovieData?.genres?.map((genre) => (
                  <span key={genre.id} className="bg-blue-700/80 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                    {genre.name}
                  </span>
                ))}
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${mediaType === "movie" ? "bg-blue-500" : "bg-green-500"} text-white`}>
                  {mediaType === "movie" ? "Movie" : "TV Show"}
                </span>
                {singleMovieData.vote_average && (
                  <span className="bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
                    ⭐ {singleMovieData.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              {mediaType === "tv" && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-200 mb-2">
                  <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                    <b>Seasons:</b> {singleMovieData.number_of_seasons}
                  </span>
                  <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                    <b>Episodes:</b> {singleMovieData.number_of_episodes}
                  </span>
                  {singleMovieData.episode_run_time && singleMovieData.episode_run_time.length > 0 && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Ep. Runtime:</b> {singleMovieData.episode_run_time[0]} min
                    </span>
                  )}
                  {singleMovieData.status && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Status:</b> {singleMovieData.status}
                    </span>
                  )}
                  {singleMovieData.first_air_date && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>First Air:</b> {singleMovieData.first_air_date}
                    </span>
                  )}
                  {singleMovieData.last_air_date && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Last Air:</b> {singleMovieData.last_air_date}
                    </span>
                  )}
                </div>
              )}
              {mediaType === "movie" && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-200 mb-2">
                  {singleMovieData.runtime && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Runtime:</b> {singleMovieData.runtime} min
                    </span>
                  )}
                  {singleMovieData.status && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Status:</b> {singleMovieData.status}
                    </span>
                  )}
                  {singleMovieData.release_date && (
                    <span className="bg-gray-800/70 px-3 py-1 rounded-lg">
                      <b>Release:</b> {singleMovieData.release_date}
                    </span>
                  )}
                </div>
              )}
              <div className="text-lg text-white/90 mt-2">
                <span className="font-bold text-yellow-400">Plot:</span> {singleMovieData.overview}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 mb-8">
                {/* Likes/Hearts */}
                <div className="flex items-center gap-2 text-pink-500 text-2xl font-bold">
                  <FaHeart
                    className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                      userHasLiked 
                        ? "text-pink-500 hover:text-pink-400" 
                        : "text-gray-400 hover:text-pink-300"
                    }`}
                    onClick={handleLikeClick}
                  />
                  <span className="text-white text-lg font-semibold">{likes}</span>
                </div>
                {/* Star Rating and Write a Review */}
                {user && user.data && user.data.username ? (
                  <div className="flex flex-col items-center sm:items-start">
                    <StarRating
                      value={starRating}
                      onRatingChange={handleRatingChange}
                    />
                    <div className="mt-2 text-lg font-semibold text-yellow-400">
                      Your Rating: {starRating > 0 ? starRating : "Not rated yet"}
                    </div>
                    <button
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      onClick={toggleModal}
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      onClick={handleLoginRedirect}
                    >
                      Login to write a review
                    </button>
                  </div>
                )}
                {/* Add to Watchlist Button */}
                <div className="flex items-center gap-4 mt-6 mb-2">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-white ${
                      isInWatchlist
                        ? "bg-green-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={handleAddToWatchlist}
                    disabled={isInWatchlist}
                  >
                    <FaPlus />
                    {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-12">
          {videos.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                Videos
              </h2>
              <MovieVideos videos={videos} />
            </div>
          )}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">Top Cast</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {cast.map((actor, index) => (
                <ActorCard
                  key={actor.id + '-' + (actor.name || index)}
                  id={actor.id}
                  name={actor.name}
                  profilePath={actor.profile_path}
                  character={actor.character}
                  gender={actor.gender}
                />
              ))}
            </div>
          </div>
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">Crew</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {crew.map((crewMember, index) => (
                <Link to={`/celebrity/${crewMember.id}`} key={crewMember.id + '-' + (crewMember.job || crewMember.name || '') + '-' + index}>
                  <div className="w-32 text-center">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crewMember.profile_path}`}
                      alt={crewMember.name}
                      className="w-32 h-32 rounded-lg object-cover mx-auto mb-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = crewMember.gender === 1 ? female_image : male_image;
                      }}
                    />
                    <p className="font-semibold text-sm text-white">{crewMember.name}</p>
                    <p className="text-gray-400 text-xs">{crewMember.job}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="mb-16">
            <WatchProviders providers={watchProviders} />
          </div>
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">Other Reviews</h2>
            {otherReviews && otherReviews.length > 0 ? (
              <OtherReviews reviews={otherReviews} />
            ) : (
              <p className="text-center text-gray-400">No other reviews available.</p>
            )}
          </div>
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">Recommended {mediaType === "tv" ? `Shows` : `Movies`}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {loadingRecommendations ? (
                Array(4)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="w-56 h-80 bg-gray-800 rounded-lg animate-pulse"></div>
                  ))
              ) : recommendations.length > 0 ? (
                recommendations.map((movie, index) => (
                  <MovieCard
                    key={movie.id + '-' + (movie.media_type || index)}
                    id={movie.id}
                    title={movie.title || movie.name}
                    image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    year={new Date(movie.release_date || movie.first_air_date).getFullYear()}
                    type={mediaType === "tv" ? "tv" : "movie"}
                    rating={movie.vote_average}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} toggleModal={toggleModal}>
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto">
          <div className="flex space-x-4">
            {/* Movie Image - Left Side */}
            <div className="flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w154${singleMovieData?.poster_path}`}
                alt={singleMovieData.title || singleMovieData.name}
                className="w-20 h-28 rounded object-cover"
              />
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 space-y-4">
              {/* Movie Info */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {singleMovieData?.title || singleMovieData?.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {(singleMovieData?.release_date || singleMovieData?.first_air_date || "").slice(0, 4)}
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">⭐ Your Rating</label>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                      <FaStar
                        key={index}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        color={ratingValue <= starRatingTemp ? "#ffc107" : "#e4e5e9"}
                        size={24}
                        onClick={() => setStarRatingTemp(ratingValue)}
                      />
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-600">
                    {starRatingTemp > 0 ? `${starRatingTemp}/5` : "Click to rate"}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">📅 Date Watched</label>
                <DatePicker
                  selected={dateLogged}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  maxDate={new Date()}
                  placeholderText="Select date"
                />
              </div>

              {/* Review */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">📝 Your Review</label>
                <div className="border border-gray-300 rounded">
                  <ReactQuill
                    value={review}
                    onChange={setReview}
                    theme="snow"
                    placeholder="Add a review..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                      ],
                    }}
                    style={{ 
                      height: '120px',
                      backgroundColor: 'white'
                    }}
                    formats={['bold', 'italic', 'underline', 'list', 'bullet']}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-12">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
                  onClick={handleReviewSubmit}
                  disabled={!dateLogged || !review.trim() || starRatingTemp === 0}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MoviePage;

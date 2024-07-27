import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
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

// const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
import ActorCard from "./ActorCard.jsx";
const MoviePage = () => {
  const male_image =
    "https://w7.pngwing.com/pngs/328/335/png-transparent-icon-user-male-avatar-business-person-profile.png";
  const female_image =
    "https://w7.pngwing.com/pngs/869/174/png-transparent-icon-user-female-avatar-business-person-profile-thumbnail.png";
  const navigate = useNavigate();
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
  const { watchmodeID } = useParams();
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
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const fetchCastData = useCallback(() => {
    if (singleMovieData?.id) {
      let url = `https://api.themoviedb.org/3/movie/${singleMovieData.id}/credits?language=en-US`;
      if (watchmodeID.includes("tv")) url = url.replace("/movie/", "/tv/");
      // let movieID = watchmodeID.replace("tv", "");
      // movieID = watchmodeID.replace("movie", "");
      // url = url.replace(watchmodeID, movieID);
      fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZmY0Mjc2MDc2MmUyZWVmZjY1ZTgwNDE5MmVhZDk3MSIsIm5iZiI6MTcyMDAyNjYyNC40OTUzNDEsInN1YiI6IjY1OWQ1OWZjYjZjZmYxMDE0Y2Y3NTdjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7k2PEFKq60uUNx9SvvbJPr6UhNOu8RiKkbWYSbYhCd8",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.crew);
          setCast(data.cast.slice(0, 10));
          setCrew(data.crew.slice(0, 10));
        })
        .catch((err) => console.error("Error fetching cast:", err));
    }
  }, [singleMovieData?.id]);

  useEffect(() => {
    fetchCastData();
  }, [fetchCastData]);
  useEffect(() => {
    const fetchMovieData = () => {
      let url = `https://api.themoviedb.org/3/movie/${watchmodeID}?language=en-US`;
      if (watchmodeID.includes("tv")) url = url.replace("/movie/", "/tv/");
      let movieID = watchmodeID.replace("tv", "");
      movieID = watchmodeID.replace("movie", "");
      url = url.replace(watchmodeID, movieID);
      console.log(url);
      fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
        },
      })
        .then((response) => response.json())
        .then(async (res) => {
          console.log("brakinsdf", res);
          setImdbID(res.imdb_id);
          await setSingleMovieData(res);
          setLoading(false);
          fetchVideos(); // Call fetchVideos after movie data is fetched
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    const fetchOtherReviews = (reviewID) => {
      fetch(
        `http://localhost:3000/api/review/getOtherReviews/${imdbID}/${reviewID}`,
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

    const fetchPersonalReview = () => {
      fetch(`http://localhost:3000/api/review/getPersonalReview/${imdbID}`, {
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

    const fetchLikes = () => {
      fetch(`http://localhost:3000/api/movie/getLikes/${imdbID}/likes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setLikes(data.likes);
          setUserHasLiked(data.liked);
        })
        .catch((err) => {
          console.error("Error fetching likes:", err);
        });
    };
    const fetchWatchProviders = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${watchmodeID}/watch/providers`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
            },
          }
        );
        const data = await response.json();
        setWatchProviders(data.results.IN);
      } catch (error) {
        console.error("Error fetching watch providers:", error);
      }
    };
    const fetchVideos = async () => {
      setVideoLoading(true);
      try {
        let url = `https://api.themoviedb.org/3/movie/${watchmodeID}/videos?language=en-US`;
        if (watchmodeID.includes("tv")) url = url.replace("/movie/", "/tv/");
        let movieID = watchmodeID.replace("tv", "");
        movieID = watchmodeID.replace("movie", "");
        url = url.replace(watchmodeID, movieID);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
          },
        });
        const data = await response.json();
        console.log(data);
        setVideos(
          (data.results &&
            data.results.slice(Math.max(data.results.length - 6, 0))) ||
            []
        );
        console.log(videos);
        setVideoLoading(false);
      } catch (err) {
        console.error(err);
        setVideoLoading(false);
      }
    };
    fetchMovieData();
    fetchPersonalReview();
    fetchLikes();
    fetchWatchProviders();
    // fetchVideos();
  }, [watchmodeID, imdbID]);

  useEffect(() => {
    const getRecommendations = async () => {
      if (singleMovieData?.id) {
        setLoadingRecommendations(true);
        try {
          let url = `https://api.themoviedb.org/3/movie/${singleMovieData.id}/recommendations?language=en-US&page=1`;
          if (watchmodeID.includes("tv")) url = url.replace("/movie/", "/tv/");
          // let movieID = watchmodeID.replace("tv", "");
          // movieID = watchmodeID.replace("movie", "");
          // url = url.replace(watchmodeID, movieID);
          const response = await fetch(url, {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization:
                "bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
            },
          });

          const data = await response.json();
          console.log("123123123", data);
          setRecommendations(data.results.slice(0, 5));
          consol;
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    };

    getRecommendations();
  }, [singleMovieData]);

  const toggleModal = () => {
    fetch("http://localhost:3000/api/auth/verify/", {
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

    fetch("http://localhost:3000/api/review/postReview", {
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

  const handleLike = () => {
    fetch(`http://localhost:3000/api/movie/postLikes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imdbID,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          data.message === "UNAUTHORIZED, LOGIN AGAIN WITH YOUR CREDENTIALS"
        ) {
          toast.error(
            "UNAUTHORIZED, LOGIN WITH YOUR CREDENTIALS TO LOG, REVIEW OR RATE."
          );
          navigate("/login");
          return;
        }
        if (data.message === "Like removed successfully.") {
          setUserHasLiked(false);
          toast.success(data.message);
          setLikes((prevLikes) => prevLikes - 1);
        } else if (data.message === "Movie liked successfully.") {
          setUserHasLiked(true);
          toast.success(data.message);
          setLikes((prevLikes) => prevLikes + 1);
        }
      })
      .catch((err) => {
        console.error("Error liking the movie:", err);
        toast.error(err.message || "Failed to like the movie.");
      });
  };

  const handleDateChange = (date) => {
    setDateLogged(date);
  };

  if (singleMovieData?.success === false) {
    return <NotFound />;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${singleMovieData.backdrop_path})`,
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      ></div>

      <div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-900 to-gray-900 pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-400">
              {`${singleMovieData?.title || singleMovieData?.name} (${new Date(
                singleMovieData?.release_date || singleMovieData?.first_air_date
              ).getFullYear()})`}
            </h1>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
              <img
                src={`https://image.tmdb.org/t/p/w500${singleMovieData?.poster_path}`}
                alt={singleMovieData.title || singleMovieData.name}
                className="w-full max-w-xs md:w-1/4 rounded-lg shadow-lg"
              />
              <div className="flex-1 space-y-6">
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">
                    Runtime:
                  </span>{" "}
                  {singleMovieData.runtime} minutes
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">Genre:</span>{" "}
                  {singleMovieData?.genres
                    ? singleMovieData.genres
                        .map((genre) => genre.name)
                        .join(", ")
                    : "N/A"}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">Plot:</span>{" "}
                  {singleMovieData.overview}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">
                    User Rating:
                  </span>{" "}
                  {singleMovieData.vote_average}
                </p>
                <div className="flex items-center space-x-4">
                  <p className="font-semibold text-yellow-400">Your Rating:</p>
                  <StarRating rating={starRating} />
                  {!personalReview && (
                    <p className="text-gray-400 italic">
                      You haven't rated it yet
                    </p>
                  )}
                </div>

                <div className="flex items-center mt-6 space-x-4 flex-wrap">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 md:mb-0"
                    onClick={toggleModal}
                  >
                    Write a Review
                  </button>
                  <button
                    className={`flex items-center bg-gray-800  text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                      userHasLiked ? "bg-red-500" : "text-gray-300"
                    }`}
                    onClick={handleLike}
                  >
                    <FaHeart className="mr-2" size={25} />
                    {likes}
                  </button>
                </div>
              </div>
            </div>

            {personalReview && (
              <Link
                to={`/movie-page/${imdbID}/${personalReview._id}`}
                className="block mx-auto max-w-3xl mt-12"
              >
                <div className="p-6 rounded-lg shadow-xl bg-gray-800 hover:bg-gray-700 transition duration-300">
                  <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
                    Your Latest Review
                  </h2>
                  <div className="flex items-start space-x-6">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${singleMovieData.poster_path}`}
                      alt={`${singleMovieData.title} poster`}
                      className="rounded-lg shadow-md w-40"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-4 space-x-4">
                        <ReadOnlyStarRating rating={personalReview.rating} />
                        <span className="text-gray-400">
                          {personalReview.dateLogged}
                        </span>
                      </div>
                      <ReactQuill
                        value={
                          personalReview.review.substring(
                            0,
                            personalReview.review.length / 2
                          ) + "...."
                        }
                        readOnly={true}
                        theme="snow"
                        modules={{ toolbar: false }}
                        className="bg-gray-700 text-gray-200 p-4 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {videos.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                  Videos
                </h2>
                <MovieVideos videos={videos} />
              </div>
            )}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                Top Cast
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {cast.map((actor) => (
                  <ActorCard
                    key={actor.id}
                    id={actor.id}
                    name={actor.name}
                    profilePath={actor.profile_path}
                    character={actor.character}
                    gender={actor.gender}
                  />
                ))}
              </div>
            </div>
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                Crew
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {crew.map((crewMember) => (
                  <Link to={`/celebrity/${crewMember.id}`}>
                    <div key={crewMember.id} className="w-32 text-center">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${crewMember.profile_path}`}
                        alt={crewMember.name}
                        className="w-32 h-32 rounded-lg object-cover mx-auto mb-2"
                        onError={(e) => {
                          e.target.onerror = null;

                          e.target.src =
                            crewMember.gender === 1 ? female_image : male_image;
                        }}
                      />
                      <p className="font-semibold text-sm">{crewMember.name}</p>
                      <p className="text-gray-400 text-xs">{crewMember.job}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-16">
              <WatchProviders providers={watchProviders} />
            </div>
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                Other Reviews
              </h2>
              {otherReviews && otherReviews.length > 0 ? (
                <OtherReviews reviews={otherReviews} />
              ) : (
                <p className="text-center text-gray-400">
                  No other reviews available.
                </p>
              )}
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                Recommended {watchmodeID.includes("tv") ? `Shows` : `Movies`}
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {loadingRecommendations ? (
                  Array(4)
                    .fill()
                    .map((_, index) => (
                      <div
                        key={index}
                        className="w-56 h-80 bg-gray-800 rounded-lg animate-pulse"
                      >
                        <div className="w-full h-48 bg-gray-700 rounded-t-lg"></div>
                        <div className="p-4">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                ) : recommendations.length > 0 ? (
                  recommendations.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title || movie.name}
                      image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      year={new Date(
                        movie.release_date || movie.first_air_date
                      ).getFullYear()}
                      type={watchmodeID.includes("tv") ? "tv" : "movie"}
                      rating={movie.vote_average}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-400">
                    No recommendations available.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Modal isOpen={showModal} toggleModal={toggleModal}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Write a Review
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Date Logged
            </label>
            <DatePicker
              selected={dateLogged}
              onChange={handleDateChange}
              dateFormat="dd-MM-yyyy"
              className="text-gray-900 p-2 border border-gray-300 rounded-lg w-full"
              maxDate={new Date()}
              todayButton="Today"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Your Review
            </label>
            <ReactQuill
              value={review}
              onChange={setReview}
              theme="snow"
              className="bg-gray-100 text-gray-900 p-2 rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <p className="font-bold text-gray-900">Your Rating:</p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <FaStar
                    key={index}
                    className="cursor-pointer"
                    color={
                      ratingValue <= starRatingTemp ? "#ffc107" : "#e4e5e9"
                    }
                    size={25}
                    onClick={() => setStarRatingTemp(ratingValue)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleReviewSubmit}
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MoviePage;

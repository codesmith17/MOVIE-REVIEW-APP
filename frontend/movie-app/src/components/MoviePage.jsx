import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { TiHeartFullOutline } from "react-icons/ti";
import OtherReviews from "./OtherReviews";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaStar, FaFilm, FaPlay } from "react-icons/fa";
import ReadOnlyStarRating from "./ReadOnlyStarRating.jsx";
import { useContext } from "react";
import { UserContext } from "./UserContext";
// import Loading from "./Loading.jsx";

import Modal from "./Modal.jsx";
import { fetchRecommendations } from "../utils/GeminiApiReccomendations.js";
import MovieCard from "./MovieCard.jsx";
import NotFound from "./NotFound.jsx";
const MoviePage = () => {
  const navigate = useNavigate();
  const { watchmodeID } = useParams();
  // console.log(useParams());
  const [dateLogged, setDateLogged] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [starRatingTemp, setStarRatingTemp] = useState(0);
  const [singleMovieData, setSingleMovieData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recoIDs, setRecoIDs] = useState([]);
  const [personalReview, setPersonalReview] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [otherReviews, setOtherReviews] = useState([]);
  const [currentReviewID, setCurrentReviewID] = useState("");
  const [imdbID, setImdbID] = useState("");
  const { user } = useContext(UserContext);
  useEffect(() => {
    const fetchMovieData = () => {
      // console.log(watchmodeID);
      fetch(
        `https://api.watchmode.com/v1/title/${watchmodeID}/details/?apiKey=5lDOaemgU9N05xbuoa1n6WHFGkok3EAkQ9qyefIQ`
      )
        .then((response) => response.json())
        .then((res) => {
          console.log(res);
          setImdbID(res.imdb_id);
          if (res.Error === "Incorrect IMDb ID." || res.Response === "False") {
          }
          setSingleMovieData(res);
          setRecoIDs(
            res.similar_titles.slice(0, Math.min(5, res.similar_titles.length))
          );
          // console.log("12312313123123123", res);
          localStorage.setItem(imdbID, res.Poster);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    const fetchOtherReviews = (reviewID) => {
      console.log(reviewID);
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
          // console.log(res);
          if (res.status === 204) return;
          return res.json();
        })
        .then((data) => {
          console.log(data.reviews);
          if (data) setOtherReviews(data.reviews);
          else return;
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
          console.log(res);
          if (!res.ok) {
            if (res.status === 401) {
              console.log("hih");
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
          // console.log(res);
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
          setPersonalReview(null); // Handle error case
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
        .then((res) => {
          // console.log("!2", res);
          return res.json();
        })
        .then((data) => {
          // console.log("123123", data);
          setLikes(data.likes);
          // console.log(data.liked);
          setUserHasLiked(data.liked);
        })
        .catch((err) => {
          console.error("Error fetching likes:", err);
        });
    };

    fetchMovieData();
    // console.log(user);

    fetchPersonalReview();

    fetchLikes();
  }, []);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    const getDataFromAPI = async (singleID) => {
      try {
        const singleData = await fetch(
          `https://api.watchmode.com/v1/title/${singleID}/details/?apiKey=5lDOaemgU9N05xbuoa1n6WHFGkok3EAkQ9qyefIQ`
        );
        const data = await singleData.json();
        if (
          data.success === false ||
          data.statusCode === 404 ||
          data.statusMessage === "Title not found"
        ) {
          console.warn(`Movie not found: ${singleID}`);
          return null;
        }
        return {
          year: data.year,
          type: data.type,
          name: data.title,
          id: data.id,
          imdbID: data.imdb_id,
          poster: data.poster !== null ? data.poster : null,
        };
      } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
      }
    };

    const getRecommendations = async () => {
      if (singleMovieData?.title && singleMovieData?.year) {
        setLoadingRecommendations(true);
        try {
          const data = await Promise.all(
            recoIDs.map((singleID) => getDataFromAPI(singleID))
          );
          const filteredData = data.filter((item) => item !== null);
          console.log(filteredData);
          setRecommendations(filteredData);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    };

    getRecommendations();
  }, [singleMovieData, imdbID]);
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

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
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
            rating: starRatingTemp, // Update the state with starRatingTemp
            dateLogged: formattedDate,
          });
          setShowModal(false); // Close the modal after submitting
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
      .then((res) => {
        console.log("like", res);
        return res.json();
      })
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

  // Handle change in date logged input
  const handleDateChange = (date) => {
    setDateLogged(date);
  };

  if (
    singleMovieData?.errorMessage === "Over plan quota on this API Key." ||
    singleMovieData?.success === false
  ) {
    return <NotFound />;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${singleMovieData.backdrop})`,
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
          <p className="text-center text-2xl">Loading...</p>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-400">
              {`${singleMovieData?.title} (${singleMovieData?.year})`}
            </h1>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
              <img
                src={singleMovieData?.poster}
                alt={singleMovieData?.title}
                className="w-full max-w-xs md:w-1/4 rounded-lg shadow-lg"
              />
              <div className="flex-1 space-y-6">
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">
                    Runtime:
                  </span>{" "}
                  {singleMovieData.runtime_minutes} minutes
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">Genre:</span>{" "}
                  {singleMovieData?.genre_names
                    ? singleMovieData.genre_names.join(", ")
                    : "N/A"}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">Plot:</span>{" "}
                  {singleMovieData.plot_overview}
                </p>

                <p className="text-lg">
                  <span className="font-semibold text-yellow-400">
                    User Rating:
                  </span>{" "}
                  {singleMovieData.user_rating / 2}
                </p>
                <div className="flex items-center space-x-4">
                  <p className="font-semibold text-yellow-400">Your Rating:</p>
                  <ReadOnlyStarRating rating={starRating} />
                  {!personalReview && (
                    <p className="text-gray-400 italic">
                      You haven't rated it yet
                    </p>
                  )}
                </div>
                {singleMovieData.trailer ? (
                  <a
                    href={singleMovieData.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    <FaPlay className="mr-2" /> Watch Trailer
                  </a>
                ) : (
                  <div className="inline-flex items-center bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded">
                    <FaFilm className="mr-2" /> No Trailer Available
                  </div>
                )}
                <div className="flex items-center mt-6 space-x-4 flex-wrap">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 md:mb-0"
                    onClick={toggleModal}
                  >
                    Write a Review
                  </button>
                  <button
                    className={`flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                      userHasLiked ? "text-red-500" : "text-gray-300"
                    }`}
                    onClick={handleLike}
                  >
                    <TiHeartFullOutline className="mr-2" size={25} />
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
                      src={singleMovieData.poster}
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
                            personalReview.review.length * 0.2
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
                Recommended Movies
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
                      id={movie.id}
                      title={movie.name}
                      image={movie.poster}
                      year={movie.year}
                      type={movie.type}
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

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { TiHeartFullOutline } from "react-icons/ti";
import OtherReviews from "./OtherReviews";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaStar } from "react-icons/fa";
import ReadOnlyStarRating from "./ReadOnlyStarRating.jsx";
import { useContext } from "react";
import { UserContext } from "./UserContext";
// import Loading from "./Loading.jsx";
import Modal from "./Modal.jsx";

const MoviePage = () => {
  const navigate = useNavigate();
  const { imdbID } = useParams();
  const [dateLogged, setDateLogged] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [starRatingTemp, setStarRatingTemp] = useState(0);
  const [singleMovieData, setSingleMovieData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState("");
  const [personalReview, setPersonalReview] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [otherReviews, setOtherReviews] = useState([]);
  const [currentReviewID, setCurrentReviewID] = useState("");
  const { user } = useContext(UserContext);
  useEffect(() => {
    const fetchMovieData = () => {
      fetch(`http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=1f0a0eb9`)
        .then((response) => response.json())
        .then((res) => {
          setSingleMovieData(res);
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
        `https://movie-review-app-do6z.onrender.com/api/review/getOtherReviews/${imdbID}/${reviewID}`,
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
      fetch(
        `https://movie-review-app-do6z.onrender.com/api/review/getPersonalReview/${imdbID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      )
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
          if (res.message === "NO REVIEW FOUND") {
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
      fetch(
        `https://movie-review-app-do6z.onrender.com/api/movie/getLikes/${imdbID}/likes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      )
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

  const toggleModal = () => {
    fetch("https://movie-review-app-do6z.onrender.com/api/auth/verify/", {
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
    fetch("https://movie-review-app-do6z.onrender.com/api/review/postReview", {
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
    fetch(`https://movie-review-app-do6z.onrender.com/api/movie/postLikes`, {
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

  // if (!user) {
  //   return <Loading loading={true}></Loading>;
  // }

  return (
    <div className="container bg-gray-900 text-gray-100 mx-auto p-4 md:px-12 lg:px-24">
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-6 text-center">
            {singleMovieData.Title}
          </h1>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <img
              src={singleMovieData.Poster}
              alt={singleMovieData.Title}
              className="w-full max-w-xs md:w-1/3 rounded-lg shadow-md"
            />
            <div className="flex-1 space-y-4">
              <p>
                <strong>Runtime:</strong> {singleMovieData.Runtime}
              </p>
              <p>
                <strong>Genre:</strong> {singleMovieData.Genre}
              </p>
              <p>
                <strong>Director:</strong> {singleMovieData.Director}
              </p>
              <p>
                <strong>Plot:</strong> {singleMovieData.Plot}
              </p>
              <p>
                <strong>Average Rating: </strong>
                {singleMovieData.imdbRating / 2}
              </p>
              <div className="flex items-center space-x-2">
                <p className="font-bold">Your Rating:</p>
                <ReadOnlyStarRating rating={starRating} />
                {!personalReview && <p>YOU HAVEN'T RATED IT YET</p>}
              </div>
              <div className="flex items-center mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={toggleModal}
                >
                  Write a Review
                </button>
                <div className="flex items-center ml-4">
                  <button
                    className={`flex items-center ${
                      userHasLiked ? "text-red-500 " : "text-gray-600"
                    }`}
                    onClick={handleLike}
                  >
                    <TiHeartFullOutline className="mr-1" size={25} />
                    {likes}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {personalReview && (
            <Link
              to={`/movie-page/${imdbID}/${personalReview._id}`}
              className="block mx-auto max-w-lg"
            >
              <div className="mt-8 p-4 rounded-lg shadow-md text-black bg-white hover:text-gray-100 hover:bg-gray-800 transition duration-300">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Your Latest Review
                </h2>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={singleMovieData.Poster}
                      alt={`${singleMovieData.Title} poster`}
                      className="rounded-lg shadow-md w-32"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 space-x-2">
                      <ReadOnlyStarRating rating={personalReview.rating} />
                      <span className="text-gray-600">
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
                      className="bg-gray-700 text-gray-200 p-2 rounded-lg max-w-64"
                    />
                  </div>
                </div>
              </div>
            </Link>
          )}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Other Reviews</h2>
            {otherReviews && otherReviews.length > 0 ? (
              <OtherReviews reviews={otherReviews} />
            ) : (
              <p>No other reviews available.</p>
            )}
          </div>

          {/* Modal for writing a review */}
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
        </>
      )}
    </div>
  );
};

export default MoviePage;

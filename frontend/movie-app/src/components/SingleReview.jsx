import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "./UserContext"; // Assuming UserContext is in the same directory
import Loading from "./Loading";
const SingleReview = () => {
  const { imdbID, reviewID } = useParams();
  const { user } = useContext(UserContext); // Call useContext at the top level
  const [personalReview, setPersonalReview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [moviePoster, setMoviePoster] = useState(localStorage.getItem(imdbID));
  const [darkMode, setDarkMode] = useState(false); // Toggle dark mode state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (user) {
      setProfilePicture(user.data.profilePicture);
    }
    fetchSingleReview();
    fetchComments();

    if (!moviePoster) {
      handlePosterError();
    }
  }, [user]); // Dependency array ensures updates on user change

  const fetchSingleReview = async () => {
    const response = await fetch(
      `http://localhost:3000/api/review/getReviewById/${imdbID}/${reviewID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      setPersonalReview(data.review);
    } else {
      console.error("Failed to fetch personal review");
      setPersonalReview(null);
    }
  };

  const fetchComments = async () => {
    const response = await fetch(
      `http://localhost:3000/api/comment/getCommentsByReviewId/${reviewID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    // console.log(response.json());
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data) {
        if (data.data.length > 0) setComments(data.data);
      }
    } else {
      console.error("Failed to fetch comments");
    }
  };

  const handleLike = () => {
    if (!personalReview) return;

    fetch("http://localhost:3000/api/review/postReviewLikes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        currentReviewID: reviewID,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("You cannot like your own review");
        }
      })
      .then((data) => {
        setPersonalReview((prev) => ({
          ...prev,
          likes: data.likes,
        }));
        toast.success("Review liked/unliked successfully!");
      })
      .catch((error) => {
        toast.error(error.message);
        console.error(error);
      });
  };

  const handlePosterError = () => {
    fetch(`http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=1f0a0eb9`)
      .then((response) => response.json())
      .then((data) => {
        if (data.Poster) {
          setMoviePoster(data.Poster);
          localStorage.setItem(imdbID, data.Poster);
        } else {
          console.error("Failed to fetch movie poster from OMDB API");
        }
      })
      .catch((error) => {
        console.error("Error fetching movie poster from OMDB API:", error);
      });
  };

  const handleCommentSubmit = async () => {
    const date = new Date();
    const utcDate = date.toISOString(); // String representation in UTC
    const timezone = "Asia/Kolkata";

    const dataForDatabase = `${utcDate},${timezone}`;
    const response = await fetch(
      `http://localhost:3000/api/comment/postComment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reviewID,
          username: user.data.username,
          comment: newComment,
          profilePicture: user.data.profilePicture,
          time: dataForDatabase,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } else {
      toast.error("Failed to post comment");
    }
  };

  const handleCommentLike = async (commentID) => {
    const response = await fetch(
      `http://localhost:3000/api/comments/likeComment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentID,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentID
            ? { ...comment, likes: data.likes }
            : comment
        )
      );
      toast.success("Comment liked/unliked successfully!");
    } else {
      toast.error("Failed to like/unlike comment");
    }
  };

  const handleCommentDislike = async (commentID) => {
    const response = await fetch(
      `http://localhost:3000/api/comments/dislikeComment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentID,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentID
            ? { ...comment, dislikes: data.dislikes }
            : comment
        )
      );
      toast.success("Comment disliked/undisliked successfully!");
    } else {
      toast.error("Failed to dislike/undislike comment");
    }
  };

  if (!user) {
    return <Loading loading={true}></Loading>;
  }
  if (!personalReview) {
    return <Loading loading={true}></Loading>;
  }

  const displayHtmlReview = () => {
    return { __html: personalReview.review };
  };

  return (
    <div className={`max-w-3xl mx-auto mt-8 ${darkMode ? "dark" : "light"}`}>
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          {profilePicture && (
            <Link to={`/user/${user.data._id}`}>
              <img
                src={profilePicture}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-4 shadow-md cursor-pointer transition duration-500 hover:scale-125 flex justify-center items-center"
              />
            </Link>
          )}
          <h2 className="text-3xl font-bold">{user.data.username}'s Review</h2>
        </div>
      </div>
      <div className="border p-6 rounded-lg shadow-md bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800">
        <div className="flex items-center mb-2">
          <p className="text-lg font-semibold mr-4">Rating: </p>
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
              const filledStars = Math.floor(personalReview.rating);
              const isHalfStar =
                personalReview.rating % 1 !== 0 && index === filledStars;

              if (index < filledStars) {
                return <FaStar key={index} className="text-yellow-400 mr-1" />;
              } else if (isHalfStar) {
                return (
                  <FaStarHalfAlt key={index} className="text-yellow-400 mr-1" />
                );
              } else {
                return <FaStar key={index} className="text-gray-300 mr-1" />;
              }
            })}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Date Logged: {personalReview.dateLogged}
        </p>
        <div
          className="text-base ql-editor"
          dangerouslySetInnerHTML={displayHtmlReview()}
        />
        <div className="flex items-center mt-4">
          <AiOutlineLike
            className="text-xl text-gray-500 mr-2 cursor-pointer"
            onClick={handleLike}
          />
          <span>{personalReview.likes}</span>
        </div>
      </div>
      <div className="mt-4">
        <img
          src={moviePoster}
          alt="Movie Poster"
          className="rounded-lg shadow-md w-full"
          onError={handlePosterError}
        />
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Comments</h3>
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-2 bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800 py-2 px-4 rounded"
          >
            Post Comment
          </button>
        </div>
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="border p-4 rounded-lg shadow-md mb-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={comment.profilePicture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="font-semibold">{comment.username}</p>
              </div>
              <p className="text-sm text-gray-500">{comment.datePosted}</p>
            </div>
            <p className="mt-2">{comment.comment}</p>
            <div className="flex items-center mt-2">
              <AiOutlineLike
                className="text-xl text-gray-500 mr-2 cursor-pointer"
                onClick={() => handleCommentLike(comment._id)}
              />
              <span className="mr-4">{comment.likes}</span>
              <AiOutlineDislike
                className="text-xl text-gray-500 mr-2 cursor-pointer"
                onClick={() => handleCommentDislike(comment._id)}
              />
              <span>{comment.dislikes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleReview;

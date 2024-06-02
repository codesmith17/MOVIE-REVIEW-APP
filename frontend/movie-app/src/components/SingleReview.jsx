import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiFillDislike } from "react-icons/ai";
import DatePicker from "react-datepicker";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ReadOnlyStarRating from "./ReadOnlyStarRating.jsx";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillLike } from "react-icons/ai";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "./UserContext";
import Loading from "./Loading";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Modal from "./Modal";
const SingleReview = () => {
  const { imdbID, reviewID } = useParams();
  const [rating, setRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [currentReviewLiked, setCurrentReviewLiked] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentLiked, setCurrentLiked] = useState([]);
  const [currentDisliked, setCurrentDisliked] = useState([]);
  const [personalReview, setPersonalReview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [moviePoster, setMoviePoster] = useState(localStorage.getItem(imdbID));
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showReplyInput, setShowReplyInput] = useState({});
  const [replyComment, setReplyComment] = useState({});
  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [commentsToFetch, setCommentsToFetch] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [starRatingTemp, setStarRatingTemp] = useState(0);
  const navigate = useNavigate();
  const handleEditReview = () => {
    setShowModal(!showModal);
  };
  console.log(starRatingTemp);
  const fetchUserData = async (username) => {
    // setIsLoading(true);
    // console.log(username);

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/getOthersData/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");

        return;
      }

      const data = await response.json();
      if (!data || !data.data) {
        throw new Error("User data not found");
      }
      setFetchedUserData(data);
      // console.log("123,", fetchedUserData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setNotFound(true);
    }
  };

  useEffect(() => {
    if (user) {
      setProfilePicture(user.data.profilePicture);
    }
    fetchSingleReview();
    fetchComments();

    if (!moviePoster) {
      handlePosterError();
    }
  }, [user]);

  const fetchSingleReview = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/review/getReviewById/${imdbID}/${reviewID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // console.log(response);
        if (response.status === 204) {
          toast.error("NO SUCH REVIEW EXIST");
          navigate(`/movie-page/${imdbID}`);
          return;
        }
        const data = await response.json();
        // console.log(data);
        setPersonalReview(data.review);
        // console.log(personalReview);
        const dateLoggedString = data.review.dateLogged;
        const dateLogged = new Date(
          dateLoggedString.split("/").reverse().join("-")
        );
        if (!isNaN(dateLogged.getTime())) {
          setSelectedDate(dateLogged);
        } else {
          console.error("Invalid date format:", dateLoggedString);
        }
        setCurrentReview(personalReview?.review);
        if (!user) {
          fetchUserData(data.review.username);
        }
      } else {
        console.error("Failed to fetch personal review");
        setPersonalReview(null);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/getCommentsByReviewId/${reviewID}?limit=${commentsToFetch}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        // console.log(response);
        if (response.status === 204) {
          setComments([]);
          return;
        }
        const data = await response.json();
        setComments(data.data);

        const likedComments = data.data
          .filter((comment) => comment?.likedBy.includes(user?.data.username))
          .map((comment) => comment?._id);
        setCurrentLiked(likedComments);
        const dislikedComments = data?.data
          .filter((comment) =>
            comment?.dislikedBy.includes(user?.data.username)
          )
          .map((comment) => comment?._id);
        setCurrentDisliked(dislikedComments);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
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
        currentReviewID: personalReview._id, // Using personalReview._id to get the current review ID
      }),
    })
      .then((response) => {
        // console.log(response);
        if (!response.ok) {
          // Check if response is unauthorized due to liking own review
          if (response.status === 401) {
            throw new Error("You cannot like your own review");
          } else {
            throw new Error("Failed to like/unlike the review");
          }
        }
        return response.json();
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
        console.error("Error:", error);
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
  const handleReviewEditSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/review/updateReview/${personalReview?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            review: currentReview,
            rating: starRatingTemp,
            dateLogged: selectedDate, // Convert date to "YYYY-MM-DD" format
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPersonalReview(data.updatedReview);
        setShowModal(false);
        toast.success("Review updated successfully!");
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };
  const handleCommentSubmit = async () => {
    const date = new Date();
    const utcDate = date.toISOString();
    const timezone = "Asia/Kolkata";
    const dataForDatabase = `${utcDate},${timezone}`;

    try {
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
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const handleCommentLike = async (commentID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/likeComment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            commentID,
            username: user.data.username,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (currentDisliked.includes(commentID)) {
          setCurrentDisliked((prev) => prev.filter((id) => id !== commentID));
        }
        if (data.message === "Comment liked successfullytrue") {
          setCurrentLiked((prev) => [...prev, commentID]);
          toast.success("Comment liked successfully!");
        } else {
          setCurrentLiked((prev) => prev.filter((id) => id !== commentID));
          toast.success("Comment unliked successfully!");
        }
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? { ...comment, likes: data.likes }
              : comment
          )
        );
      } else {
        toast.error("Failed to like/unlike comment");
      }
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
      toast.error("Failed to like/unlike comment");
    }
  };

  const handleCommentDislike = async (commentID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/dislikeComment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            commentID,
            username: user.data.username,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (currentLiked.includes(commentID)) {
          setCurrentLiked((prev) => prev.filter((id) => id !== commentID));
        }
        if (data.message === "Comment disliked successfullytrue") {
          setCurrentDisliked((prev) => [...prev, commentID]);
          toast.success("Comment disliked successfully!");
        } else {
          setCurrentDisliked((prev) => prev.filter((id) => id !== commentID));
          toast.success("Comment undisliked successfully!");
        }
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? { ...comment, dislikes: data.dislikes }
              : comment
          )
        );
      } else {
        toast.error("Failed to dislike/undislike comment");
      }
    } catch (error) {
      console.error("Error disliking/undisliking comment:", error);
      toast.error("Failed to dislike/undislike comment");
    }
  };

  const handleReplySubmit = async (commentID) => {
    if (!user) {
      toast.error("PLEASE LOGIN TO REPLY/COMMENT");
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/postReply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            commentID,
            reply: replyComment[commentID],
            username: user.data.username,
            profilePicture: user.data.profilePicture,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), data.reply],
                }
              : comment
          )
        );
        setReplyComment((prev) => ({ ...prev, [commentID]: "" }));
        toast.success("Reply posted successfully!");
      } else {
        toast.error("Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    }
  };

  const fetchMoreComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/getCommentsByReviewId/${reviewID}?limit=${commentsToFetch}`,
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
        setComments((prev) => [...prev, ...data.data]);
        setCommentsToFetch((prev) => prev + 10);
      } else {
        console.error("Failed to fetch more comments");
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
    }
  };
  const handleDeleteReview = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (confirmDelete) {
      deleteReview();
    }
  };

  const deleteReview = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/review/deleteReview/${reviewID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Review deleted successfully!");
        navigate(`/movie-page/${imdbID}`); // Navigate to the home page after successful deletion
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };
  const getTimeAgo = (dateString) => {
    let utcDateString;
    if (dateString) utcDateString = dateString.split(",")[0].trim();
    // console.log(utcDateString);
    const time = new Date(utcDateString);
    const now = new Date();

    const seconds = Math.floor((now - time) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return `${interval}y ago`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return `${interval}m ago`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return `${interval}d ago`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return `${interval}h ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return `${interval}m ago`;
    }
    return `${Math.floor(seconds)}s ago`;
  };

  const displayHtmlReview = () => {
    return { __html: personalReview.review };
  };

  if (!personalReview) {
    return <Loading loading={true}></Loading>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="max-w-xl mx-auto bg-gray-900 text-gray-100 p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg shadow-lg">
        <div className="flex justify-between mb-2 sm:mb-4">
          <div className="flex items-center">
            {(profilePicture || fetchedUserData?.data.profilePicture) && (
              <Link to={`/user/${user?.data.username}`}>
                <img
                  src={profilePicture || fetchedUserData?.data.profilePicture}
                  alt="Profile"
                  className="w-8 sm:w-10 md:w-12 rounded-full mr-2 sm:mr-4 shadow-md cursor-pointer transition duration-500 hover:scale-125 flex justify-center items-center"
                />
              </Link>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {personalReview.username}'s Review
            </h2>
          </div>
          {user?.data.username === personalReview.username && (
            <div className="flex">
              <button
                onClick={handleDeleteReview}
                className="bg-red-500 hover:bg-red-700 mx-10 text-white font-bold py-1 px-2 rounded flex items-center"
              >
                <MdDelete className="mr-1" />
              </button>
              <button
                onClick={handleEditReview}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
              >
                <FaEdit className="mr-1" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="md:w-2/3 border p-2 sm:p-4 md:p-6 rounded-lg shadow-md bg-gray-800 text-white">
            <div className="flex items-center mb-1 sm:mb-2">
              <p className="text-sm sm:text-base md:text-lg font-semibold mr-2 sm:mr-4">
                Rating:{" "}
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                  const filledStars = Math.floor(personalReview.rating);
                  const isHalfStar =
                    personalReview.rating % 1 !== 0 && index === filledStars;

                  if (index < filledStars) {
                    return (
                      <FaStar key={index} className="text-yellow-400 mr-1" />
                    );
                  } else if (isHalfStar) {
                    return (
                      <FaStarHalfAlt
                        key={index}
                        className="text-yellow-400 mr-1"
                      />
                    );
                  } else {
                    return (
                      <FaStar key={index} className="text-gray-300 mr-1" />
                    );
                  }
                })}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              Date Logged: {personalReview.dateLogged}
            </p>
            <div
              className="text-sm sm:text-base ql-editor"
              dangerouslySetInnerHTML={displayHtmlReview()}
            />
            <div className="flex items-center mt-2 sm:mt-4">
              <AiFillLike
                className={`text-lg sm:text-xl ${
                  currentLiked.includes(personalReview._id)
                    ? "text-blue-500"
                    : "text-gray-500"
                } mr-1 sm:mr-2 cursor-pointer`}
                onClick={handleLike}
              />
              <span>{personalReview.likes}</span>
            </div>
          </div>
          <div className="md:w-1/3 mt-2 sm:mt-4 md:mt-0">
            <img
              src={moviePoster}
              alt="Movie Poster"
              className="rounded-lg shadow-md w-full"
              onError={handlePosterError}
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-28">
          <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">
            Comments
          </h3>
          {user ? (
            <div className="mb-2 sm:mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 sm:p-4 rounded-lg border text-gray-800 border-gray-300 focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={handleCommentSubmit}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <h2>PLEASE LOGIN TO POST COMMENTS</h2>
          )}
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment?._id}
                className="border p-2 sm:p-4 md:p-6 rounded-lg shadow-md mb-2 sm:mb-4 bg-gray-800 text-white"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {comment ? (
                      <Link to={`/user/${comment?.username}`}>
                        <img
                          src={comment?.profilePicture}
                          alt="Profile"
                          className="w-6 sm:w-8 rounded-full mr-1 sm:mr-2"
                        />
                      </Link>
                    ) : (
                      <div className="w-6 sm:w-8 rounded-full mr-1 sm:mr-2 bg-gray-500"></div>
                    )}
                    <p className="font-semibold">{comment?.username}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {getTimeAgo(comment?.time)}
                  </p>
                </div>
                <p className="mt-1 sm:mt-2 break-words">{comment?.comment}</p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <AiFillLike
                    className={`text-lg sm:text-xl ${
                      currentLiked.includes(comment?._id)
                        ? "text-blue-500"
                        : "text-gray-500"
                    } mr-1 sm:mr-2 cursor-pointer`}
                    onClick={() => handleCommentLike(comment?._id)}
                  />
                  <span className="mr-2 sm:mr-4">{comment?.likes || 0}</span>
                  <AiFillDislike
                    className={`text-lg sm:text-xl ${
                      currentDisliked.includes(comment?._id)
                        ? "text-red-700"
                        : "text-gray-500"
                    } text-gray-500 mr-1 sm:mr-2 cursor-pointer`}
                    onClick={() => handleCommentDislike(comment?._id)}
                  />
                  <span>{comment?.dislikes}</span>
                </div>

                {showReplyInput[comment?._id] && (
                  <div className="mt-2">
                    <textarea
                      value={replyComment[comment?._id] || ""}
                      onChange={(e) =>
                        setReplyComment((prev) => ({
                          ...prev,
                          [comment?._id]: e.target.value,
                        }))
                      }
                      placeholder="Reply to this comment..."
                      className="w-full p-2 rounded-lg border text-gray-800 border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                    <button
                      onClick={() => handleReplySubmit(comment?._id)}
                      className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Post Reply
                    </button>
                  </div>
                )}

                <button
                  onClick={() =>
                    setShowReplyInput((prev) => ({
                      ...prev,
                      [comment?._id]: !prev[comment?._id],
                    }))
                  }
                  className="mt-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
                >
                  {showReplyInput[comment?._id] ? "Cancel" : "Reply"}
                </button>

                <div className="ml-4 mt-2">
                  <h4 className="font-semibold">Replies:</h4>
                  {comment?.replies && comment?.replies.length > 0 ? (
                    comment?.replies.map((reply, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded-lg mb-2"
                      >
                        <div className="flex items-center">
                          {reply?.profilePicture ? (
                            <Link to={`/user/${reply?.username}`}>
                              <img
                                src={reply?.profilePicture}
                                alt="Profile"
                                className="w-6 rounded-full mr-2"
                              />
                            </Link>
                          ) : (
                            <div className="w-6 rounded-full mr-2 bg-gray-500"></div>
                          )}
                          <p className="font-semibold">{reply?.username}</p>
                        </div>
                        <p>{reply?.reply}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No replies yet</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">NO COMMENTS YET</p>
          )}
          <div className="mt-4">
            <button
              onClick={fetchMoreComments}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Fetch More Comments
            </button>
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} toggleModal={handleEditReview}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Write a Review
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Date Logged
            </label>
            <DatePicker
              selected={selectedDate}
              // onChange={handleDateChange}
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
              value={currentReview}
              onChange={setCurrentReview}
              theme="snow"
              className="bg-gray-100 text-gray-900 p-2 rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <p className="font-bold text-gray-900">Add New Rating:</p>
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
              onClick={handleReviewEditSubmit}
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SingleReview;

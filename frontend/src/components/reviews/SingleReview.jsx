import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiFillDislike } from "react-icons/ai";
import DatePicker from "react-datepicker";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../styles/quill-dark.css";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillLike } from "react-icons/ai";
import { StarRating, ReadOnlyStarRating, Loading } from "../common";
import {
  FaStar,
  FaStarHalfAlt,
  FaEdit,
  FaCalendarAlt,
  FaThumbsUp,
  FaReply,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { Modal } from "../modals";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const SingleReview = () => {
  const { imdbID, reviewID } = useParams();

  const [selectedDate, setSelectedDate] = useState(null);
  // const { user, setUser } = useContext(UserContext);
  const user = useSelector((state) => state.user.data);
  const [currentReviewLiked, setCurrentReviewLiked] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentLiked, setCurrentLiked] = useState([]);
  const [currentDisliked, setCurrentDisliked] = useState([]);
  const [personalReview, setPersonalReview] = useState(null);
  const [rating, setRating] = useState(personalReview?.rating || 0);
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
  const [replyLikes, setReplyLikes] = useState({});
  const [totalComments, setTotalComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  // New function to handle reply likes
  const [_, setIsUpdatingRating] = useState(false);

  const handleRatingChange = async (newRating) => {
    setRating(newRating);
    setIsUpdatingRating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/review/updateRating/${personalReview._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ rating: newRating }),
        },
      );
      if (response.status === 400) {
        toast.error("Failed to update rating. Please login to rate");
        navigate("/login");
        return;
      }
      console.log(response);
      if (response.status === 401) {
        const currentRating = rating;
        toast.error("You are unauthorized");
        setRating(currentRating);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to update rating");
      }

      const updatedReview = await response.json();

      setPersonalReview(updatedReview);
      toast.success("Rating updated successfully!");
      setRating(personalReview.rating);
    } catch (error) {
      console.error("Error updating rating:", error);
    } finally {
      setIsUpdatingRating(false);
    }
  };
  const handleReplyLike = async (commentId, replyIndex) => {
    // console.log(replyIndex);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/likeReply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentId,
          replyIndex,
          username: user.data.username,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply, index) =>
                    index === replyIndex
                      ? { ...reply, likes: data.likes }
                      : reply,
                  ),
                }
              : comment,
          ),
        );
        setReplyLikes((prev) => ({
          ...prev,
          [`${commentId}-${replyIndex}`]: !prev[`${commentId}-${replyIndex}`],
        }));
        toast.success(data.message);
      } else {
        toast.error("Failed to like/unlike reply");
      }
    } catch (error) {
      console.error("Error liking/unliking reply:", error);
      toast.error("Failed to like/unlike reply");
    }
  };
  const navigate = useNavigate();
  const handleEditReview = () => {
    // Initialize the temp rating with current rating when opening modal
    if (!showModal) {
      setStarRatingTemp(rating);
      setCurrentReview(personalReview.review);
    }
    setShowModal(!showModal);
  };
  const fetchUserData = async (username) => {
    // setIsLoading(true);
    // console.log(username);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/getOthersData/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
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

  // Update rating when personalReview changes
  useEffect(() => {
    if (personalReview?.rating) {
      setRating(personalReview.rating);
      setStarRatingTemp(personalReview.rating);
    }
  }, [personalReview]);

  const fetchSingleReview = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/review/getReviewById/${imdbID}/${reviewID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
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
          dateLoggedString.split("/").reverse().join("-"),
        );
        if (!isNaN(dateLogged.getTime())) {
          setSelectedDate(dateLogged);
        } else {
          console.error("Invalid date format:", dateLoggedString);
        }
        setRating(data?.review?.rating);
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
        `${API_BASE_URL}/api/comment/getCommentsByReviewId/${reviewID}?limit=${commentsToFetch}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        // console.log(response);
        if (response.status === 204) {
          setComments([]);
          setTotalComments(0);
          setHasMoreComments(false);
          return;
        }
        const data = await response.json();
        setComments(data.data);
        setTotalComments(data.total || data.data.length);
        setHasMoreComments(data.data.length >= commentsToFetch);

        const likedComments = data.data
          .filter((comment) => comment?.likedBy.includes(user?.data.username))
          .map((comment) => comment?._id);
        setCurrentLiked(likedComments);
        const dislikedComments = data?.data
          .filter((comment) =>
            comment?.dislikedBy.includes(user?.data.username),
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

    fetch(`${API_BASE_URL}/api/review/postReviewLikes`, {
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
    // Check if it's a TV show or movie from TMDB
    if (imdbID.startsWith("tv-") || imdbID.startsWith("movie-")) {
      const mediaType = imdbID.startsWith("tv-") ? "tv" : "movie";
      const mediaId = imdbID.replace(/^(tv|movie)-/, "");

      fetch(
        `https://api.themoviedb.org/3/${mediaType}/${mediaId}?language=en-US`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
            setMoviePoster(posterUrl);
            localStorage.setItem(imdbID, posterUrl);
          } else {
            console.error("Failed to fetch poster from TMDB API");
          }
        })
        .catch((error) => {
          console.error("Error fetching poster from TMDB API:", error);
        });
    } else {
      // Use TMDB's find API for traditional IMDB IDs
      fetch(
        `https://api.themoviedb.org/3/find/${imdbID}?external_source=imdb_id&language=en-US`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          // Check both movie_results and tv_results
          const result = data.movie_results?.[0] || data.tv_results?.[0];
          if (result?.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
            setMoviePoster(posterUrl);
            localStorage.setItem(imdbID, posterUrl);
          } else {
            console.error("Failed to fetch movie poster from TMDB API");
          }
        })
        .catch((error) => {
          console.error("Error fetching poster from TMDB API:", error);
        });
    }
  };
  const handleReviewEditSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/review/updateReview/${personalReview?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            review: currentReview,
            rating: starRatingTemp,
            dateLogged: selectedDate,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPersonalReview(data.updatedReview);
        setRating(starRatingTemp); // Update the rating state
        setShowModal(false);
        toast.success("Review updated successfully!");
        // Refresh to show updated content
        window.location.reload();
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
      const response = await fetch(`${API_BASE_URL}/api/comment/postComment`, {
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
      });

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
      const response = await fetch(`${API_BASE_URL}/api/comment/likeComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentID,
          username: user.data.username,
        }),
      });

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
              : comment,
          ),
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
        `${API_BASE_URL}/api/comment/dislikeComment`,
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
        },
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
              : comment,
          ),
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
      const response = await fetch(`${API_BASE_URL}/api/comment/postReply`, {
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
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), data.reply],
                }
              : comment,
          ),
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
      // Increment the limit first
      const newLimit = commentsToFetch + 10;
      setCommentsToFetch(newLimit);

      const response = await fetch(
        `${API_BASE_URL}/api/comment/getCommentsByReviewId/${reviewID}?limit=${newLimit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Replace comments with the full list (API returns all comments up to the limit)
        setComments(data.data);
        setTotalComments(data.total || data.data.length);

        // Check if there are more comments to load
        setHasMoreComments(data.data.length < (data.total || data.data.length));

        // Update liked/disliked states
        const likedComments = data.data
          .filter((comment) => comment?.likedBy.includes(user?.data.username))
          .map((comment) => comment?._id);
        setCurrentLiked(likedComments);

        const dislikedComments = data?.data
          .filter((comment) =>
            comment?.dislikedBy.includes(user?.data.username),
          )
          .map((comment) => comment?._id);
        setCurrentDisliked(dislikedComments);
      } else {
        console.error("Failed to fetch more comments");
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
    }
  };

  const handleDeleteComment = async (commentID) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment? All replies will also be deleted.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comment/deleteComment/${commentID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reviewOwner: personalReview.username,
          }),
        },
      );

      if (response.ok) {
        // Update the comment to show as deleted instead of removing it
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? {
                  ...comment,
                  comment: "This comment was deleted by review owner or admin",
                  deleted: true,
                  replies: [],
                }
              : comment,
          ),
        );
        toast.success("Comment deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeleteReply = async (commentID, replyIndex) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/deleteReply`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentID,
          replyIndex,
          reviewOwner: personalReview.username,
        }),
      });

      if (response.ok) {
        // Remove the specific reply
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentID
              ? {
                  ...comment,
                  replies: comment.replies.filter(
                    (_, index) => index !== replyIndex,
                  ),
                }
              : comment,
          ),
        );
        toast.success("Reply deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete reply");
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };

  // Check if user can delete (is review owner or is "krishna")
  const canDelete = (commentUsername) => {
    return (
      user?.data?.username === personalReview?.username ||
      user?.data?.username === "krishna"
    );
  };
  const handleDeleteReview = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?",
    );
    if (confirmDelete) {
      deleteReview();
    }
  };

  const deleteReview = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/review/deleteReview/${reviewID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
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

  const MAX_CHARACTERS = 8000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full mx-auto"
      >
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 mb-4 sm:mb-6 md:mb-8">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5" />
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-6">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                {(profilePicture || fetchedUserData?.data.profilePicture) && (
                  <Link to={`/user/${personalReview.username}`}>
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={
                        profilePicture || fetchedUserData?.data.profilePicture
                      }
                      alt="Profile"
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full ring-2 sm:ring-4 ring-cyan-500/20 shadow-xl cursor-pointer"
                    />
                  </Link>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-100 to-cyan-400 bg-clip-text text-transparent break-words">
                    {personalReview.username}'s Review
                  </h1>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 text-gray-400 text-xs sm:text-sm">
                    <FaCalendarAlt />
                    <span className="break-words">
                      {personalReview.dateLogged}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {user?.data.username === personalReview.username && (
                <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteReview}
                    className="flex-1 md:flex-initial bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg transition duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <MdDelete className="text-base sm:text-lg md:text-xl" />{" "}
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditReview}
                    className="flex-1 md:flex-initial bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg transition duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <FaEdit className="text-base sm:text-lg md:text-xl" /> Edit
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Review Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-4 sm:p-6 md:p-8"
            >
              {/* Rating Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-slate-100">
                  Rating
                </h3>
                <div className="bg-slate-700/30 rounded-xl p-4 sm:p-6 flex justify-center sm:justify-start">
                  <StarRating
                    value={rating}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-slate-100">
                  Review
                </h3>
                <div
                  className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed bg-slate-700/30 rounded-xl p-4 sm:p-6 ql-editor prose prose-invert prose-sm sm:prose-base md:prose-lg max-w-none"
                  dangerouslySetInnerHTML={displayHtmlReview()}
                />
              </div>

              {/* Like Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 sm:gap-4 bg-slate-700/30 rounded-xl p-3 sm:p-4 w-fit"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 ${
                    currentLiked.includes(personalReview._id)
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                      : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                  }`}
                >
                  <AiFillLike className="text-lg sm:text-xl md:text-2xl" />
                  <span className="text-base sm:text-lg font-bold">
                    {personalReview.likes}
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Movie Poster Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-3 sm:p-4">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={moviePoster}
                alt="Movie Poster"
                className="rounded-lg sm:rounded-xl shadow-2xl w-full"
                onError={handlePosterError}
              />
            </div>
          </motion.div>
        </div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8 md:mt-12 relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-4 sm:p-6 md:p-8"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-slate-100">
            Comments
          </h3>

          {user ? (
            <div className="mb-6 sm:mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCommentSubmit}
                className="mt-3 sm:mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 rounded-lg shadow-lg transition duration-300 text-sm sm:text-base w-full sm:w-auto"
              >
                Post Comment
              </motion.button>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 text-center py-6 sm:py-8 bg-slate-700/30 rounded-xl">
              <p className="text-base sm:text-lg md:text-xl text-gray-300 px-4">
                Please{" "}
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  login
                </Link>{" "}
                to post comments
              </p>
            </div>
          )}

          {comments && comments.length > 0 ? (
            comments.map((comment, index) => (
              <motion.div
                key={comment?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Link to={`/user/${comment?.username}`}>
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={comment?.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-cyan-500/20 shadow-lg cursor-pointer flex-shrink-0"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/user/${comment?.username}`}
                        className="hover:text-cyan-300 transition"
                      >
                        <p className="font-bold text-sm sm:text-base md:text-lg text-white truncate">
                          {comment?.username}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-400">
                        {getTimeAgo(comment?.time)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button - Only show if user can delete */}
                  {canDelete() && !comment?.deleted && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteComment(comment?._id)}
                      className="flex-shrink-0 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all duration-200 border border-red-500/30"
                      title="Delete comment"
                    >
                      <MdDelete className="text-lg" />
                    </motion.button>
                  )}
                </div>

                <p
                  className={`mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed break-words ${
                    comment?.deleted ? "text-gray-500 italic" : "text-gray-200"
                  }`}
                >
                  {comment?.comment}
                </p>

                {!comment?.deleted && (
                  <div className="flex flex-wrap items-center mt-4 sm:mt-5 md:mt-6 gap-2 sm:gap-3 md:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommentLike(comment?._id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm md:text-base ${
                        currentLiked.includes(comment?._id)
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-600/50 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <AiFillLike className="text-sm sm:text-base md:text-lg" />
                      <span>{comment?.likes || 0}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommentDislike(comment?._id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm md:text-base ${
                        currentDisliked.includes(comment?._id)
                          ? "bg-red-600 text-white shadow-lg"
                          : "bg-gray-600/50 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <AiFillDislike className="text-sm sm:text-base md:text-lg" />
                      <span>{comment?.dislikes || 0}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setShowReplyInput((prev) => ({
                          ...prev,
                          [comment?._id]: !prev[comment?._id],
                        }))
                      }
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-600/50 text-gray-300 hover:bg-gray-600 font-semibold transition-all text-xs sm:text-sm md:text-base"
                    >
                      <FaReply />
                      {showReplyInput[comment?._id] ? "Cancel" : "Reply"}
                    </motion.button>
                  </div>
                )}

                {showReplyInput[comment?._id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-slate-600/30 rounded-xl p-4"
                  >
                    <textarea
                      value={replyComment[comment?._id] || ""}
                      onChange={(e) =>
                        setReplyComment((prev) => ({
                          ...prev,
                          [comment?._id]: e.target.value,
                        }))
                      }
                      placeholder="Write your reply..."
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReplySubmit(comment?._id)}
                      className="mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                      Post Reply
                    </motion.button>
                  </motion.div>
                )}

                {comment?.replies && comment?.replies.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-bold text-lg text-cyan-300 mb-4">
                      Replies ({comment.replies.length})
                    </h4>
                    {comment?.replies.map((reply, replyIndex) => (
                      <motion.div
                        key={replyIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: replyIndex * 0.05 }}
                        className="bg-slate-600/40 backdrop-blur-sm p-5 rounded-xl border border-slate-500/30 ml-6"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Link to={`/user/${reply?.username}`}>
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={reply?.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full ring-2 ring-cyan-500/20 cursor-pointer"
                              />
                            </Link>
                            <div>
                              <Link
                                to={`/user/${reply?.username}`}
                                className="hover:text-cyan-300 transition"
                              >
                                <p className="font-semibold text-white">
                                  {reply?.username}
                                </p>
                              </Link>
                              <p className="text-xs text-gray-400">
                                {getTimeAgo(reply?.time)}
                              </p>
                            </div>
                          </div>

                          {/* Delete Reply Button */}
                          {canDelete() && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleDeleteReply(comment?._id, replyIndex)
                              }
                              className="flex-shrink-0 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all duration-200 border border-red-500/30"
                              title="Delete reply"
                            >
                              <MdDelete className="text-base" />
                            </motion.button>
                          )}
                        </div>
                        <p className="text-gray-200 mb-3">{reply?.reply}</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleReplyLike(comment?._id, replyIndex)
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                            replyLikes[`${comment?._id}-${replyIndex}`]
                              ? "bg-blue-600 text-white"
                              : "bg-gray-500/50 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          <AiFillLike />
                          <span>{reply?.likes || 0}</span>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}

          {hasMoreComments && comments.length > 0 && (
            <div className="mt-10 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchMoreComments}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition duration-300 border border-gray-600/50"
              >
                Load More Comments
              </motion.button>
            </div>
          )}

          {!hasMoreComments && comments.length > 0 && (
            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm">All comments loaded</p>
            </div>
          )}
        </motion.div>
      </motion.div>
      <Modal isOpen={showModal} toggleModal={handleEditReview}>
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-slate-100">
            Edit Review
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Date Logged
              </label>
              <DatePicker
                selected={selectedDate}
                dateFormat="dd-MM-yyyy"
                className="text-white bg-slate-800 p-2 sm:p-3 border border-slate-600 rounded-lg w-full focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
                maxDate={new Date()}
                todayButton="Today"
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 gap-2">
                <label className="block text-slate-300 font-semibold text-sm sm:text-base">
                  Your Review
                </label>
                <span
                  className={`text-xs sm:text-sm ${
                    currentReview?.length > MAX_CHARACTERS
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {currentReview?.replace(/<[^>]*>/g, "").length || 0} /{" "}
                  {MAX_CHARACTERS} characters
                </span>
              </div>
              <div className="bg-slate-800 border border-slate-600 rounded-lg">
                <ReactQuill
                  value={currentReview}
                  onChange={(value) => {
                    const textLength = value.replace(/<[^>]*>/g, "").length;
                    if (textLength <= MAX_CHARACTERS) {
                      setCurrentReview(value);
                    } else {
                      toast.error(
                        `Review cannot exceed ${MAX_CHARACTERS} characters`,
                      );
                    }
                  }}
                  theme="snow"
                  className="text-white text-sm sm:text-base"
                  style={{
                    backgroundColor: "#1e293b",
                    color: "white",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Rating
              </label>
              <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4 inline-block">
                <StarRating
                  value={starRatingTemp}
                  onRatingChange={setStarRatingTemp}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <button
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg transition duration-300 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleEditReview}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                onClick={handleReviewEditSubmit}
                disabled={
                  currentReview?.replace(/<[^>]*>/g, "").length > MAX_CHARACTERS
                }
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SingleReview;

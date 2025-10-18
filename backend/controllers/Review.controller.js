const Review = require("../models/Review.model");
const User = require("../models/User.model");
const { Op } = require("sequelize");

const postReview = async (req, res, next) => {
  const { imdbID, rating, review, dateLogged, username } = req.body;
  const userEmail = req.user.email;

  // Validate request body
  if (!imdbID) {
    return res.status(400).json({ message: "IMDB ID is required." });
  }

  try {
    const savedReview = await Review.create({
      email: userEmail,
      imdbID,
      rating,
      dateLogged,
      review,
      username,
    });

    res.status(200).json({ message: "Review posted successfully.", review: savedReview });
  } catch (err) {
    console.error("Error posting review:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getPersonalReview = async (req, res, next) => {
  const email = req.user.email;
  const imdbID = req.params.imdbID;

  console.log(email, imdbID);

  try {
    const response = await Review.findOne({ where: { email, imdbID } });

    if (response) {
      res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
    } else {
      res.status(204).json({ message: "NO REVIEW FOUND" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "BAD REQUEST" });
  }
};

const getReviewById = async (req, res, next) => {
  const imdbID = req.params.imdbID;

  try {
    const response = await Review.findOne({ where: { imdbID } });

    if (response) {
      res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
    } else {
      res.status(204).json({ message: "NO REVIEW FOUND" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "BAD REQUEST" });
  }
};

const getOtherReviews = async (req, res, next) => {
  const imdbID = req.params.imdbID;
  const reviewID = req.params.reviewID;
  console.log(req.user);

  try {
    const response = await Review.findAll({
      where: {
        imdbID,
        id: { [Op.ne]: reviewID },
      },
      order: [["createdAt", "DESC"]], // Sort by newest first
      limit: 2,
    });

    if (response.length > 0) {
      res.status(200).json({ message: "REVIEWS AVAILABLE", reviews: response });
    } else {
      res.status(204).json({ message: "NO REVIEWS AVAILABLE", reviews: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "BAD REQUEST" });
  }
};

const postReviewLikes = async (req, res, next) => {
  const userEmail = req.user.email;
  const currentReviewID = req.body.currentReviewID;

  try {
    // Find the review by ID
    const response = await Review.findByPk(currentReviewID);

    if (!response) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (userEmail === response.email) {
      return res.status(401).json({ message: "YOU ARE NOT ALLOWED TO LIKE YOUR OWN REVIEW" });
    }

    const likedArray = response.likedBy || [];
    let newLikeArray;
    let likes;

    // Check if the user has already liked the review
    const isLikedByUser = likedArray.some((item) => item.username === req.user.email);

    if (isLikedByUser) {
      // Unlike the review
      likes = response.likes - 1;
      newLikeArray = likedArray.filter((value) => value.username !== req.user.email);
    } else {
      // Like the review
      likes = response.likes + 1;
      newLikeArray = [
        ...likedArray,
        { username: req.user.email, profilePicture: req.user.profilePicture || "" },
      ];
    }

    // Update the review with the new like/unlike status
    await Review.update({ likes, likedBy: newLikeArray }, { where: { id: currentReviewID } });

    res.status(200).json({ message: "Review liked/unliked successfully", likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteReview = async (req, res, next) => {
  const reviewID = req.params.reviewID;

  try {
    const response = await Review.findByPk(reviewID);

    if (!response) {
      return res.status(404).json({ error: "Review not found" });
    }

    await Review.destroy({ where: { id: reviewID } });

    res.status(200).json({ message: "Review deleted successfully", response });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

const editReview = async (req, res, next) => {
  const { reviewID } = req.params;
  const { review, rating, dateLogged } = req.body;

  try {
    const [rowsUpdated] = await Review.update(
      { review, rating, dateLogged },
      { where: { id: reviewID } }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const updatedReview = await Review.findByPk(reviewID);

    res.status(200).json({ updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

const getReviews = async (req, res, next) => {
  const { username } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  try {
    const userCount = await User.count({ where: { username } });
    if (userCount === 0) {
      return res.status(404).json({ message: "No such user exists" });
    }

    // Get total count for pagination
    const totalReviews = await Review.count({ where: { username } });

    // Get paginated reviews
    const reviews = await Review.findAll({
      where: { username },
      attributes: ["id", "review", "rating", "dateLogged", "imdbID", "username"],
      order: [["dateLogged", "DESC"]], // Sort by newest first
      offset,
      limit,
    });

    return res.status(200).json({
      message: "Reviews fetched successfully",
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasMore: page < Math.ceil(totalReviews / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

const updateRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const { reviewID } = req.params;

    if (!reviewID) {
      return res.status(400).json({ error: "Review ID is required" });
    }

    const review = await Review.findByPk(reviewID);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (req.user.username !== String(review.username)) {
      return res.status(401).json({ message: "YOU ARE UNAUTHORISED" });
    }

    await Review.update({ rating }, { where: { id: reviewID } });

    const updatedReview = await Review.findByPk(reviewID);

    res.status(200).json(updatedReview);
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating" });
  }
};

const upsertRating = async (req, res, next) => {
  const { imdbID, rating, review, dateLogged } = req.body;
  const { username, email } = req.user;

  try {
    // Check if a review already exists
    const existingReview = await Review.findOne({ where: { email, imdbID } });
    console.log(existingReview);

    if (existingReview) {
      // If review exists, update the rating
      req.params.reviewID = existingReview.id;
      req.body = { imdbID, rating, review, dateLogged };
      return updateRating(req, res, next);
    } else {
      // If no review exists, create a new one
      req.body = {
        imdbID,
        rating,
        review: "",
        dateLogged: new Date().toISOString(),
        username,
      };
      return postReview(req, res, next);
    }
  } catch (err) {
    console.error("Error upserting rating:", err);
    res.status(500).json({ error: "Failed to upsert rating" });
  }
};

const getRating = async (req, res, next) => {
  const { imdbID } = req.params;
  const { username } = req.user;

  try {
    if (!imdbID || !username) {
      return res.status(400).json({ message: "IMDB ID AND USERNAME ARE REQUIRED" });
    }

    const review = await Review.findOne({
      where: { imdbID, username },
      attributes: ["rating"],
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "RATING FETCHED SUCCESSFULLY", rating: review.rating });
  } catch (err) {
    console.error("Error fetching rating:", err);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
};

const getLikedReviews = async (req, res, next) => {
  try {
    const { username } = req.params;

    // First, get the user's email from their username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found", count: 0 });
    }

    // Find all reviews where the user's email is in the likedBy array
    // Using Sequelize's JSON operators for JSONB
    const likedReviews = await Review.findAll({
      where: {
        likedBy: {
          [Op.contains]: [{ username: user.email }],
        },
      },
      order: [["dateLogged", "DESC"]],
    });

    res.status(200).json({ reviews: likedReviews, count: likedReviews.length });
  } catch (err) {
    console.error("Error in getLikedReviews:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  postReview,
  getPersonalReview,
  getReviewById,
  getOtherReviews,
  postReviewLikes,
  deleteReview,
  editReview,
  getReviews,
  updateRating,
  upsertRating,
  getRating,
  getLikedReviews,
};

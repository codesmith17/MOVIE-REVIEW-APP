const Review = require("../models/Review.model");
const User = require("../models/User.model");

const postReview = (req, res, next) => {
  const { imdbID, rating, review, dateLogged, username } = req.body;
  const userEmail = req.user.email;

  // Validate request body
  if (!imdbID) {
    return res.status(400).json({ message: "IMDB ID is required." });
  }

  const newReview = new Review({
    email: userEmail,
    imdbID,
    rating,
    dateLogged,
    review,
    username,
  });

  // Save the new review
  newReview
    .save()
    .then((savedReview) => {
      res.status(200).json({ message: "Review posted successfully.", review: savedReview });
    })
    .catch((err) => {
      console.error("Error posting review:", err);
      res.status(500).json({ message: "Server error. Please try again later." });
    });
};

const getPersonalReview = (req, res, next) => {
  const email = req.user.email;
  const imdbID = req.params.imdbID;

  console.log(email, imdbID);

  Review.findOne({ email, imdbID })
    .then((response) => {
      if (response) {
        res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
      } else {
        res.status(204).json({ message: "NO REVIEW FOUND" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "BAD REQUEST" });
    });
};

const getReviewById = (req, res, next) => {
  const imdbID = req.params.imdbID;
  // Only use reviewID if you want to fetch a specific review by MongoDB ObjectId, otherwise just use imdbID
  Review.findOne({ imdbID })
    .then((response) => {
      if (response) {
        res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
      } else {
        res.status(204).json({ message: "NO REVIEW FOUND" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "BAD REQUEST" });
    });
};

const getOtherReviews = (req, res, next) => {
  const imdbID = req.params.imdbID;
  const reviewID = req.params.reviewID;
  console.log(req.user);

  Review.find({ imdbID, _id: { $ne: reviewID } })
    .sort({ _id: -1 }) // Sort by newest first
    .limit(2)
    .then((response) => {
      if (response.length > 0) {
        res.status(200).json({ message: "REVIEWS AVAILABLE", reviews: response });
        return;
      } else {
        res.status(204).json({ message: "NO REVIEWS AVAILABLE", reviews: [] });
        return;
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "BAD REQUEST" });
    });
};

const postReviewLikes = (req, res, next) => {
  const userEmail = req.user.email;
  const currentReviewID = req.body.currentReviewID;

  // Find the review by ID
  Review.findOne({ _id: currentReviewID })
    .then((response) => {
      if (!response) {
        // Review not found
        res.status(404).json({ message: "Review not found" });
        return;
      }

      if (userEmail === response.email) {
        // Prevent liking one's own review
        res.status(401).json({ message: "YOU ARE NOT ALLOWED TO LIKE YOUR OWN REVIEW" });
        return;
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
          { username: req.user.email, profilePicture: req.user.profilePicture },
        ];
      }

      // Update the review with the new like/unlike status
      Review.updateOne({ _id: currentReviewID }, { $set: { likes, likedBy: newLikeArray } })
        .then(() => {
          res.status(200).json({ message: "Review liked/unliked successfully", likes });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
};

const deleteReview = (req, res, next) => {
  const reviewID = req.params.reviewID;

  Review.findByIdAndDelete({ _id: reviewID })
    .then((response) => {
      if (!response) {
        res.status(404).json({ error: "Review not found" });
      }
      res.status(200).json({ message: "Review deleted successfully", response });
    })
    .catch((err) => {
      console.error("Error deleting review:", err);
      res.status(500).json({ error: "Failed to delete review" });
    });
};
const editReview = (req, res, next) => {
  const { reviewID } = req.params;
  const { review, rating, dateLogged } = req.body;

  Review.findOneAndUpdate({ _id: reviewID }, { review, rating, dateLogged }, { new: true })
    .then((updatedReview) => {
      if (!updatedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(200).json({ updatedReview });
    })
    .catch((error) => {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Failed to update review" });
    });
};
const getReviews = async (req, res, next) => {
  const { username } = req.params;
  try {
    const userCount = await User.find({ username }).countDocuments();
    if (userCount === 0) {
      return res.status(404).json({ message: "No such user exists" });
    }

    const reviews = await Review.aggregate([
      { $match: { username } },
      {
        $project: {
          title: 1,
          review: 1,
          rating: 1,
          dateLogged: 1,
          imdbID: 1,
          username: 1,
          _id: 1,
        },
      },
    ]);

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews available" });
    }

    return res.status(200).json({ message: "Reviews fetched successfully", reviews });
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
    const review = await Review.findById(reviewID);
    if (req.user.username !== String(review.username)) {
      res.status(401).json({ message: "YOU ARE UNAUTHORISED" });
      return;
    }
    const updatedReview = await Review.findByIdAndUpdate(
      reviewID,
      { rating },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (err) {
    console.error("Error updating rating:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid Review ID format" });
    }
    res.status(500).json({ error: "Failed to update rating" });
  }
};

const upsertRating = async (req, res, next) => {
  const { imdbID, rating, review, dateLogged } = req.body;
  const { username, email } = req.user;

  try {
    // Check if a review already exists
    const existingReview = await Review.findOne({ email, imdbID });
    console.log(existingReview);
    if (existingReview) {
      // If review exists, update the rating
      req.params.reviewID = existingReview._id;
      req.body = { imdbID, rating, review, dateLogged };
      return updateRating(req, res, next);
    } else {
      // If no review exists, create a new one
      req.body = {
        imdbID,
        rating,
        review: "",
        dateLogged: new Date(),
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
    const review = await Review.findOne({ imdbID, username }, { rating: 1, _id: 0 });
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
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found", count: 0 });
    }

    // Find all reviews where the user's email is in the likedBy array
    // Note: The likedBy array stores email in the 'username' field (legacy naming)
    const likedReviews = await Review.find({
      "likedBy.username": user.email,
    }).sort({ dateLogged: -1 });

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

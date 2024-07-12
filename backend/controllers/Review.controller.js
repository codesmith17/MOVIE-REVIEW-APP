const Review = require("../models/Review.model");
const User = require("../models/User.model");

const postReview = (req, res, next) => {
    const { imdbID, rating, review, dateLogged, username } = req.body;
    const userEmail = req.user.email;

    // Validate request body
    if (!imdbID || !review) {
        return res.status(400).json({ message: "IMDB ID and review are required." });
    }

    const newReview = new Review({
        email: userEmail,
        imdbID,
        rating,
        dateLogged,
        review,
        username
    });

    // Save the new review
    newReview.save()
        .then(savedReview => {
            res.status(200).json({ message: "Review posted successfully.", review: savedReview });
        })
        .catch(err => {
            console.error("Error posting review:", err);
            res.status(500).json({ message: "Server error. Please try again later." });
        });
};

const getPersonalReview = (req, res, next) => {
    const email = req.user.email;
    const imdbID = req.params.imdbID;

    console.log(email, imdbID);

    Review.findOne({ email, imdbID })
        .then(response => {
            if (response) {
                res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
            } else {
                res.status(204).json({ message: "NO REVIEW FOUND" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ message: "BAD REQUEST" });
        });
};

const getReviewById = (req, res, next) => {
    const reviewID = req.params.reviewID;
    const imdbID = req.params.imdbID;

    Review.findOne({ _id: reviewID, imdbID })
        .then(response => {
            if (response) {
                console.log(response);
                res.status(200).json({ message: "REVIEW AVAILABLE", review: response });
            } else {
                res.status(204).json({ message: "NO REVIEW FOUND" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ message: "BAD REQUEST" });
        });
};


const getOtherReviews = (req, res, next) => {
    const imdbID = req.params.imdbID;
    const reviewID = req.params.reviewID;
    console.log(req.user);

    Review.find({ imdbID, _id: { $ne: reviewID } })
        .limit(2)
        .then(response => {
            if (response.length > 0) {
                res.status(200).json({ message: "REVIEWS AVAILABLE", reviews: response });
                return;
            } else {
                res.status(204).json({ message: "NO REVIEWS AVAILABLE", reviews: [] });
                return;
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ message: "BAD REQUEST" });
        });
};


const postReviewLikes = (req, res, next) => {
    const userEmail = req.user.email;
    const currentReviewID = req.body.currentReviewID;

    // Find the review by ID
    Review.findOne({ _id: currentReviewID })
        .then(response => {
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
            const isLikedByUser = likedArray.some(item => item.username === req.user.email);

            if (isLikedByUser) {
                // Unlike the review
                likes = response.likes - 1;
                newLikeArray = likedArray.filter(value => value.username !== req.user.email);
            } else {
                // Like the review
                likes = response.likes + 1;
                newLikeArray = [...likedArray, { username: req.user.email, profilePicture: req.user.profilePicture }];
            }

            // Update the review with the new like/unlike status
            Review.updateOne({ _id: currentReviewID }, { $set: { likes, likedBy: newLikeArray } })
                .then(() => {
                    res.status(200).json({ message: "Review liked/unliked successfully", likes });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: "Internal server error" });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
};

module.exports = postReviewLikes;

const deleteReview = (req, res, next) => {
    const reviewID = req.params.reviewID

    Review.findByIdAndDelete({ _id: reviewID })
        .then(response => {
            if (!response) {
                res.status(404).json({ error: "Review not found" });
            }
            res.status(200).json({ message: "Review deleted successfully", response });
        })
        .catch(err => {
            console.error("Error deleting review:", err);
            res.status(500).json({ error: "Failed to delete review" });
        })
}
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
const getReviews = async(req, res, next) => {
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
                    _id: 1

                }
            }
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



module.exports = { postReview, getPersonalReview, getReviewById, getOtherReviews, postReviewLikes, deleteReview, editReview, getReviews };
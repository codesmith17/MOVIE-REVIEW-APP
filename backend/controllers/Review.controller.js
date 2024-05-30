const Review = require("../models/Review.model");

const postReview = (req, res, next) => {
    const { imdbID, rating, review, dateLogged } = req.body;
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
    const likedBy = req.user.email;
    const currentReviewID = req.body.currentReviewID;

    Review.findOne({ _id: currentReviewID })
        .then(response => {
            if (likedBy === response.email) {
                res.status(401).json({ message: "YOU ARE NOT ALLOWED TO LIKE YOUR OWN REVIEW" });
                return;
            }

            const likedArray = response.likedBy;
            let newLikeArray;
            let likes;

            if (likedArray.includes(likedBy)) {
                // Unlike the review
                likes = response.likes - 1;
                newLikeArray = likedArray.filter(value => value !== likedBy);
            } else {
                // Like the review
                likes = response.likes + 1;
                newLikeArray = [...likedArray, likedBy];
            }

            Review.updateOne({ _id: currentReviewID }, { $set: { likes, likedBy: newLikeArray } })
                .then(() => {
                    res.status(200).json({ message: "Review liked/unliked successfully", likes });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json("Internal server error");
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json("Internal server error");
        });
};


module.exports = { postReview, getPersonalReview, getReviewById, getOtherReviews, postReviewLikes };
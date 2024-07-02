const Movie = require("../models/Movie.model");
const { fetchRecommendations, trendingMovies } = require("../utils/GeminiApiReccomendations")
const getLikes = (req, res, next) => {
    const imdbID = req.params.imdbID;
    const email = req.user ? req.user.email : null;
    // console.log("asdasd", email);
    if (!imdbID) {
        return res.status(400).json({ message: "imdbID is required." });
    }
    Movie.findOne({ imdbID })
        .then(movie => {
            if (movie) {
                const likes = movie.likes;
                const likedByCurrentUser = movie.emails.includes(email);
                res.status(200).json({ liked: likedByCurrentUser, likes: likes });
                return;
            } else {
                res.status(200).json({ liked: false, likes: 0 });
                return;
            }
        })
        .catch(err => {
            console.error("Error:", err);
            res.status(500).json({ message: "An error occurred.", error: err });
            return;
        });

}
const getRecommendations = async(req, res, next) => {
    const { imdbID, title, year } = req.params;
    try {
        const recoMovies = await fetchRecommendations(imdbID, title, year);
        res.status(200).json({ message: "SUCCESSFULLY FETCHED RECOMMENDATIONS", recoMovies });
        return;
    } catch {
        console.error("ERROR OCCURED WHILE FETCHING RECOMMENDATIONS");
        res.status(404).json({ message: "UNABLE TO FETCH RECOMMENDATIONS" });
    }
}
const getTrending = async(req, res, next) => {

    try {
        const trendMovies = await trendingMovies();
        res.status(200).json({ message: "SUCCESSFULLY FETCHED TRENDING", trendMovies });
        return;
    } catch {
        console.error("ERROR OCCURED WHILE FETCHING TRENDING");
        res.status(404).json({ message: "UNABLE TO FETCH TREDNING" });
    }
}
const postLikes = (req, res, next) => {
    const imdbID = req.body.imdbID;
    const email = req.user.email;

    if (!imdbID || !email) {
        return res.status(400).json({ message: "imdbID and email are required." });
    }

    Movie.findOne({ imdbID: imdbID })
        .then(movie => {
            if (movie) {
                if (movie.emails.includes(email)) {
                    // User has already liked the movie, remove like
                    movie.likes = Math.max(movie.likes - 1, 0);
                    movie.emails = movie.emails.filter(e => e !== email);

                    if (movie.likes === 0 || movie.emails.length === 0) {

                        Movie.findOneAndDelete({ imdbID: imdbID })
                            .then(deletedMovie => {
                                console.log("Deleted successfully:", deletedMovie);
                                res.status(200).json({ message: "Like removed successfully.", movie: deletedMovie });
                            })
                            .catch(err => {
                                console.error("Error deleting movie:", err);
                                res.status(500).json({ message: "An error occurred while deleting movie.", error: err });
                            });
                    } else {
                        // Save the updated movie with removed like
                        return movie.save().then(updatedMovie => {
                            res.status(200).json({ message: "Like removed successfully.", movie: updatedMovie });
                        });
                    }
                } else {
                    // User has not liked the movie, add like
                    movie.likes += 1;
                    movie.emails.push(email);

                    // Save the updated movie with added like
                    return movie.save().then(updatedMovie => {
                        res.status(200).json({ message: "Movie liked successfully.", movie: updatedMovie });
                    });
                }
            } else {
                // Movie not found, create new movie and add like
                const newMovie = new Movie({
                    imdbID: imdbID,
                    likes: 1,
                    emails: [email]
                });

                return newMovie.save().then(createdMovie => {
                    res.status(201).json({ message: "Movie liked successfully.", movie: createdMovie });
                });
            }
        })
        .catch(err => {
            console.error("Error:", err);
            res.status(500).json({ message: "An error occurred.", error: err });
        });
};


module.exports = { postLikes, getLikes, getRecommendations, getTrending };
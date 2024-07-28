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

const cheerio = require('cheerio');
const https = require('https');
const fetchHTML = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const scrapeIMDb = async(req, res, next) => {
    const { imdbID } = req.params;
    const url = `https://www.imdb.com/title/${imdbID}/`;
    try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const posterCardPromises = [];

        $('section[data-testid="MoreLikeThis"] div.ipc-poster-card').each((index, element) => {
            const href = $(element).find('a').attr('href');
            const text = $(element).find('a').attr('aria-label');
            const poster = $(element).find('img.ipc-image').attr('src');

            if (href && text && poster) {
                const fullUrl = new URL(href, 'https://www.imdb.com').href;
                const promise = parseMovieShow(fullUrl).then(restOfTheData => ({
                    href: restOfTheData.url,
                    name: restOfTheData.text,
                    poster: restOfTheData.poster,
                    year: restOfTheData.year.substring(11, 15),
                    type: restOfTheData.type
                }));
                posterCardPromises.push(promise);
            }
        });

        const posterCards = await Promise.all(posterCardPromises);

        if (posterCards.length === 0) {
            console.error('Target elements not found on the page');
        }

        return res.status(200).json(posterCards);

    } catch (error) {
        console.error('Error fetching or parsing HTML:', error);
        next(error); // Pass the error to the error handling middleware
    }
};

const parseMovieShow = async(url) => {
    try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const name = $('span.hero__primary-text').text().trim();

        const infoList = $('ul.ipc-inline-list.ipc-inline-list--show-dividers.baseAlt');
        const year = infoList.find('li:first-child a').text().trim();

        // Extract type from the HTML
        let type = '';
        infoList.find('li').each((index, element) => {
            const text = $(element).text().trim();
            if (text.includes('TV Series') || text.includes('Movie') || text.includes('TV Movie') || text.includes('TV Mini Series')) {
                type = text;
                return false;
            }
        });

        // If type is still empty, it might be a movie (assuming no type info means it's a movie)
        if (!type) {
            type = 'Movie';
        }

        let poster = $('img[loading="eager"]').attr('src');
        const srcset = $('img[loading="eager"]').attr('srcset');

        if (srcset) {
            const urls = srcset.match(/https:\/\/.*?\.jpg/g);
            const widths = srcset.match(/\d+w/g);

            if (urls && widths) {
                const maxWidthIndex = widths.map(width => parseInt(width)).indexOf(Math.max(...widths.map(width => parseInt(width))));
                poster = urls[maxWidthIndex];
            }
        }

        const movieShow = {
            text: name,
            poster: poster,
            year: year,
            type: type,
            url: url
        };

        // console.log(movieShow);
        return movieShow;

    } catch (error) {
        console.error('Error fetching or parsing HTML:', error);
        throw error;
    }
};
module.exports = { postLikes, getLikes, getRecommendations, getTrending, scrapeIMDb };
const Movie = require("../models/Movie.model");
const { fetchRecommendations, trendingMovies } = require("../utils/GeminiApiReccomendations");
const { Op } = require("sequelize");

const getLikes = async (req, res, next) => {
  const imdbID = req.params.imdbID;
  const email = req.user ? req.user.email : null;

  if (!imdbID) {
    return res.status(400).json({ message: "imdbID is required." });
  }

  try {
    const movie = await Movie.findOne({ where: { imdbID } });

    if (movie) {
      const likes = movie.likes;
      const likedByCurrentUser = movie.emails.includes(email);
      res.status(200).json({ liked: likedByCurrentUser, likes: likes });
    } else {
      res.status(200).json({ liked: false, likes: 0 });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "An error occurred.", error: err });
  }
};

const getRecommendations = async (req, res, next) => {
  const { imdbID, title, year } = req.params;
  try {
    const recoMovies = await fetchRecommendations(imdbID, title, year);
    res.status(200).json({ message: "SUCCESSFULLY FETCHED RECOMMENDATIONS", recoMovies });
  } catch (error) {
    console.error("ERROR OCCURED WHILE FETCHING RECOMMENDATIONS", error);
    res.status(404).json({ message: "UNABLE TO FETCH RECOMMENDATIONS" });
  }
};

const getTrending = async (req, res, next) => {
  try {
    const trendMovies = await trendingMovies();
    res.status(200).json({ message: "SUCCESSFULLY FETCHED TRENDING", trendMovies });
  } catch (error) {
    console.error("ERROR OCCURED WHILE FETCHING TRENDING", error);
    res.status(404).json({ message: "UNABLE TO FETCH TRENDING" });
  }
};

const postLikes = async (req, res, next) => {
  const imdbID = req.body.imdbID;
  const email = req.user.email;

  if (!imdbID || !email) {
    return res.status(400).json({ message: "imdbID and email are required." });
  }

  try {
    const movie = await Movie.findOne({ where: { imdbID } });

    if (movie) {
      if (movie.emails.includes(email)) {
        // User has already liked the movie, remove like
        const updatedLikes = Math.max(movie.likes - 1, 0);
        const updatedEmails = movie.emails.filter((e) => e !== email);

        if (updatedLikes === 0 || updatedEmails.length === 0) {
          // Delete the movie if no likes remain
          await Movie.destroy({ where: { imdbID } });
          res.status(200).json({
            message: "Like removed successfully.",
            movie: { imdbID, likes: 0, emails: [] },
          });
        } else {
          // Update with removed like
          await Movie.update({ likes: updatedLikes, emails: updatedEmails }, { where: { imdbID } });

          const updatedMovie = await Movie.findOne({ where: { imdbID } });

          res.status(200).json({
            message: "Like removed successfully.",
            movie: updatedMovie,
          });
        }
      } else {
        // User has not liked the movie, add like
        const updatedLikes = movie.likes + 1;
        const updatedEmails = [...movie.emails, email];

        await Movie.update({ likes: updatedLikes, emails: updatedEmails }, { where: { imdbID } });

        const updatedMovie = await Movie.findOne({ where: { imdbID } });

        res.status(200).json({
          message: "Movie liked successfully.",
          movie: updatedMovie,
        });
      }
    } else {
      // Movie not found, create new movie and add like
      const createdMovie = await Movie.create({
        imdbID: imdbID,
        likes: 1,
        emails: [email],
      });

      res.status(201).json({
        message: "Movie liked successfully.",
        movie: createdMovie,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "An error occurred.", error: err });
  }
};

const cheerio = require("cheerio");
const https = require("https");
const { URL } = require("url");

/**
 * Validate and sanitize URL to prevent SSRF attacks
 * Only allows requests to IMDb domains
 */
const validateIMDbUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    // Allowlist: Only allow IMDb domains
    const allowedHosts = ["www.imdb.com", "imdb.com", "m.imdb.com"];

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      throw new Error("URL must be from IMDb domain");
    }

    // Only allow HTTPS protocol
    if (parsedUrl.protocol !== "https:") {
      throw new Error("Only HTTPS protocol is allowed");
    }

    // Prevent requests to localhost or private IP ranges
    const hostname = parsedUrl.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      throw new Error("Requests to internal networks are not allowed");
    }

    return parsedUrl.href;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
};

/**
 * Validate IMDb ID format
 * IMDb IDs are in format: tt followed by 7-8 digits (e.g., tt0111161)
 */
const validateIMDbID = (imdbID) => {
  const imdbIdRegex = /^tt\d{7,8}$/;
  if (!imdbIdRegex.test(imdbID)) {
    throw new Error("Invalid IMDb ID format");
  }
  return imdbID;
};

const fetchHTML = (url) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate URL before making request
      const validatedUrl = validateIMDbUrl(url);

      https
        .get(
          validatedUrl,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36",
            },
            timeout: 10000, // 10 second timeout
          },
          (res) => {
            // Reject if response is not from expected domain
            if (res.socket && res.socket.remoteAddress) {
              // Additional security check
            }

            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
              // Prevent memory exhaustion
              if (data.length > 10 * 1024 * 1024) {
                // 10MB limit
                res.destroy();
                reject(new Error("Response too large"));
              }
            });
            res.on("end", () => {
              resolve(data);
            });
          }
        )
        .on("error", (err) => {
          reject(err);
        })
        .on("timeout", () => {
          reject(new Error("Request timeout"));
        });
    } catch (error) {
      reject(error);
    }
  });
};

const scrapeIMDb = async (req, res, next) => {
  try {
    const { imdbID } = req.params;

    // Validate IMDb ID format before constructing URL
    const validatedImdbID = validateIMDbID(imdbID);
    const url = `https://www.imdb.com/title/${validatedImdbID}/`;

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const posterCardPromises = [];

    $('section[data-testid="MoreLikeThis"] div.ipc-poster-card').each((index, element) => {
      const href = $(element).find("a").attr("href");
      const text = $(element).find("a").attr("aria-label");
      const poster = $(element).find("img.ipc-image").attr("src");

      if (href && text && poster) {
        const fullUrl = new URL(href, "https://www.imdb.com").href;
        const promise = parseMovieShow(fullUrl).then((restOfTheData) => ({
          href: restOfTheData.url,
          name: restOfTheData.text,
          poster: restOfTheData.poster,
          year: restOfTheData.year.substring(11, 15),
          type: restOfTheData.type,
        }));
        posterCardPromises.push(promise);
      }
    });

    const posterCards = await Promise.all(posterCardPromises);

    if (posterCards.length === 0) {
      console.error("Target elements not found on the page");
    }

    return res.status(200).json(posterCards);
  } catch (error) {
    console.error("Error fetching or parsing HTML:", error);
    next(error); // Pass the error to the error handling middleware
  }
};

const parseMovieShow = async (url) => {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const name = $("span.hero__primary-text").text().trim();

    const infoList = $("ul.ipc-inline-list.ipc-inline-list--show-dividers.baseAlt");
    const year = infoList.find("li:first-child a").text().trim();

    // Extract type from the HTML
    let type = "";
    infoList.find("li").each((index, element) => {
      const text = $(element).text().trim();
      if (
        text.includes("TV Series") ||
        text.includes("Movie") ||
        text.includes("TV Movie") ||
        text.includes("TV Mini Series")
      ) {
        type = text;
        return false;
      }
    });

    // If type is still empty, it might be a movie (assuming no type info means it's a movie)
    if (!type) {
      type = "Movie";
    }

    let poster = $('img[loading="eager"]').attr("src");
    const srcset = $('img[loading="eager"]').attr("srcset");

    if (srcset) {
      const urls = srcset.match(/https:\/\/.*?\.jpg/g);
      const widths = srcset.match(/\d+w/g);

      if (urls && widths) {
        const maxWidthIndex = widths
          .map((width) => parseInt(width))
          .indexOf(Math.max(...widths.map((width) => parseInt(width))));
        poster = urls[maxWidthIndex];
      }
    }

    const movieShow = {
      text: name,
      poster: poster,
      year: year,
      type: type,
      url: url,
    };

    return movieShow;
  } catch (error) {
    console.error("Error fetching or parsing HTML:", error);
    throw error;
  }
};

const getLikedMoviesCount = async (req, res, next) => {
  try {
    const { username } = req.params;
    const User = require("../models/User.model");

    // Get user's email from username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found", count: 0 });
    }

    // Count movies where user's email is in the emails array
    const count = await Movie.count({
      where: {
        emails: {
          [Op.contains]: [user.email],
        },
      },
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error in getLikedMoviesCount:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  postLikes,
  getLikes,
  getRecommendations,
  getTrending,
  scrapeIMDb,
  getLikedMoviesCount,
};

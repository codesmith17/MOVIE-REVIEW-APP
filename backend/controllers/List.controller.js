const List = require("../models/List.model.js");
const User = require("../models/User.model.js");

// Helper function to check if movie exists in list
const movieExistsInList = (list, movie) => {
  return list.content.some(
    (existingMovie) =>
      (movie.imdbID && existingMovie.imdbID === movie.imdbID) || existingMovie.id == movie.id
  );
};

// Helper function to match and remove movie from list
const matchAndRemoveMovie = (content, imdbID, tmdbId) => {
  return content.filter((movie) => {
    // Match by tmdbId (most reliable)
    if (tmdbId && movie.id?.toString() === tmdbId.toString()) {
      console.log(`Matched by tmdbId: ${tmdbId}`);
      return false;
    }

    // Match by imdbID
    if (imdbID && movie.imdbID === imdbID) {
      console.log(`Matched by imdbID: ${imdbID}`);
      return false;
    }

    // Match by extracted ID from fallback format (tv-2734 or movie-1234)
    if (imdbID && /^(tv|movie)-/.test(imdbID)) {
      const extractedId = imdbID.split("-")[1];
      if (movie.id?.toString() === extractedId) {
        console.log(`Matched by extracted ID: ${extractedId}`);
        return false;
      }
    }

    // Match by numeric ID string
    if (imdbID && /^\d+$/.test(imdbID) && movie.id?.toString() === imdbID) {
      console.log(`Matched by numeric imdbID: ${imdbID}`);
      return false;
    }

    return true; // Keep movie
  });
};

const getList = async (req, res, next) => {
  const { username, type } = req.params;
  try {
    // Check if user exists
    const userExists = await User.count({ where: { username } });
    if (userExists === 0) {
      return res.status(404).json({ message: "No such user exists" });
    }

    const list = await List.findAll({ where: { ownerUsername: username, type }, raw: true });

    if (list.length === 0) {
      return res.status(200).json({ message: "NO SUCH LIST AVAILABLE" });
    }

    return res.status(200).json({ message: "LISTS FETCHED SUCCESSFULLY", data: list });
  } catch (error) {
    console.error("Error occurred while fetching list:", error);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};

// Get list by ID
const getListById = async (req, res) => {
  try {
    const { listId } = req.params;

    // Find the list
    const list = await List.findOne({ where: { id: listId }, raw: true });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    return res.status(200).json({
      message: "LIST FETCHED SUCCESSFULLY",
      data: list,
    });
  } catch (error) {
    console.error("Error fetching list by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToList = async (req, res, next) => {
  const movieFetched = req.body.movie;
  const { username } = req.user;
  const { type } = req.params;
  const listName = type === "watchlist" ? "watchlist" : movieFetched?.listName;
  const listDescription = movieFetched?.listDescription || "";

  // Validate type
  if (type !== "watchlist" && type !== "normal") {
    return res.status(400).json({ message: "Invalid type. Must be 'watchlist' or 'normal'" });
  }

  // Validate list name for normal lists
  if (type === "normal") {
    if (!listName) {
      return res.status(400).json({ message: "List name is required for custom lists" });
    }
    if (listName.toLowerCase() === "watchlist") {
      return res.status(400).json({ message: "Cannot use reserved name 'watchlist'" });
    }
  }

  try {
    let list = await List.findOne({ where: { name: listName, ownerUsername: username } });

    // Create new list if it doesn't exist
    if (!list) {
      list = await List.create({
        name: listName,
        description: listDescription,
        type,
        ownerUsername: username,
        content: [],
      });
    }

    // Add movie to list if provided
    if (movieFetched) {
      if (movieExistsInList(list, movieFetched)) {
        return res.status(200).json({ message: "Movie already in the list" });
      }

      // Format poster link properly
      let posterLink = movieFetched.posterLink || movieFetched.poster_path;
      // If poster_path is just a path, prepend TMDB URL
      if (posterLink && posterLink.startsWith("/")) {
        posterLink = `https://image.tmdb.org/t/p/w500${posterLink}`;
      }

      const updatedContent = [
        ...list.content,
        {
          id: movieFetched.id,
          posterLink: posterLink,
          title: movieFetched.title || movieFetched.name, // Support TV shows
          imdbID: movieFetched.imdbID,
          mediaType: movieFetched.media_type || movieFetched.mediaType || "movie", // Default to "movie"
        },
      ];

      await List.update({ content: updatedContent }, { where: { id: list.id } });
    }

    return res.status(200).json({
      message: movieFetched ? "Movie added to the list successfully" : "List created successfully",
    });
  } catch (error) {
    console.error("Error in addToList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeFromList = async (req, res, next) => {
  const { imdbID, tmdbId } = req.body;
  const { username } = req.user;
  const { type } = req.params;

  // Validate input
  if (!imdbID && !tmdbId) {
    return res.status(400).json({ message: "Either imdbID or tmdbId is required" });
  }

  try {
    const list = await List.findOne({ where: { name: type, ownerUsername: username } });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const initialLength = list.content.length;
    const updatedContent = matchAndRemoveMovie(list.content, imdbID, tmdbId);

    if (updatedContent.length === initialLength) {
      console.log("Movie not found. Searched for:", { imdbID, tmdbId });
      console.log(
        "List content:",
        list.content.map((m) => ({ id: m.id, imdbID: m.imdbID }))
      );
      return res.status(404).json({ message: "Movie not found in the list" });
    }

    console.log(`Successfully removed ${initialLength - updatedContent.length} item(s)`);

    await List.update({ content: updatedContent }, { where: { id: list.id } });

    return res.status(200).json({ message: "Movie removed from the list successfully" });
  } catch (error) {
    console.error("Error in removeFromList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove movie from list by list ID and movie ID
const removeMovieFromList = async (req, res) => {
  try {
    const { listId, movieId } = req.params;
    const { username } = req.user;

    // Find the list
    const list = await List.findOne({ where: { id: listId, ownerUsername: username } });

    if (!list) {
      return res.status(404).json({ message: "List not found or you don't have permission" });
    }

    // Remove movie from content
    const updatedContent = list.content.filter(
      (movie) => movie.id?.toString() !== movieId.toString()
    );

    if (updatedContent.length === list.content.length) {
      return res.status(404).json({ message: "Movie not found in the list" });
    }

    // Update list
    await List.update({ content: updatedContent }, { where: { id: listId } });

    return res.status(200).json({
      message: "Movie removed from list successfully",
      data: { listId, removedMovieId: movieId },
    });
  } catch (error) {
    console.error("Error removing movie from list:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete entire list
const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { username } = req.user;

    // Find the list
    const list = await List.findOne({ where: { id: listId, ownerUsername: username } });

    if (!list) {
      return res.status(404).json({ message: "List not found or you don't have permission" });
    }

    // Prevent deletion of watchlist
    if (list.type === "watchlist") {
      return res.status(400).json({ message: "Cannot delete watchlist" });
    }

    // Delete the list
    await List.destroy({ where: { id: listId } });

    return res.status(200).json({
      message: "List deleted successfully",
      data: { listId, listName: list.name },
    });
  } catch (error) {
    console.error("Error deleting list:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getList,
  getListById,
  addToList,
  removeFromList,
  removeMovieFromList,
  deleteList,
};

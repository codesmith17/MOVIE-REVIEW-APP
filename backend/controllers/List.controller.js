const List = require("../models/List.model.js");
const User = require("../models/User.model.js");

// Helper function to check if movie exists in list
const movieExistsInList = (list, movie) => {
    return list.content.some(existingMovie => 
        (movie.imdbID && existingMovie.imdbID === movie.imdbID) || 
        existingMovie.id == movie.id
    );
};

// Helper function to match and remove movie from list
const matchAndRemoveMovie = (content, imdbID, tmdbId) => {
    return content.filter(movie => {
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
            const extractedId = imdbID.split('-')[1];
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

const getList = async(req, res, next) => {
    const { username, type } = req.params;
    try {
        // Check if user exists (optimized query)
        const userExists = await User.exists({ username });
        if (!userExists) {
            return res.status(404).json({ message: "No such user exists" });
        }

        const list = await List.find({ ownerUsername: username, type }).lean();

        if (list.length === 0) {
            return res.status(200).json({ message: "NO SUCH LIST AVAILABLE" });
        }

        return res.status(200).json({ message: "LISTS FETCHED SUCCESSFULLY", data: list });
    } catch (error) {
        console.error("Error occurred while fetching list:", error);
        res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }
};

const addToList = async(req, res, next) => {
    const movieFetched = req.body.movie;
    const { username } = req.user;
    const { type } = req.params;
    const listName = type === "watchlist" ? "watchlist" : movieFetched?.listName;

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
        let list = await List.findOne({ name: listName, ownerUsername: username });

        // Create new list if it doesn't exist
        if (!list) {
            list = new List({
                name: listName,
                type,
                ownerUsername: username,
                content: []
            });
        }

        // Add movie to list if provided
        if (movieFetched) {
            if (movieExistsInList(list, movieFetched)) {
                return res.status(200).json({ message: "Movie already in the list" });
            }

            list.content.push({
                id: movieFetched.id,
                posterLink: movieFetched.posterLink || movieFetched.poster_path,
                title: movieFetched.title,
                imdbID: movieFetched.imdbID
            });
        }

        await list.save();

        return res.status(200).json({ 
            message: movieFetched ? "Movie added to the list successfully" : "List created successfully" 
        });

    } catch (error) {
        console.error("Error in addToList:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const removeFromList = async(req, res, next) => {
    const { imdbID, tmdbId } = req.body;
    const { username } = req.user;
    const { type } = req.params;

    // Validate input
    if (!imdbID && !tmdbId) {
        return res.status(400).json({ message: "Either imdbID or tmdbId is required" });
    }

    try {
        const list = await List.findOne({ name: type, ownerUsername: username });

        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        const initialLength = list.content.length;
        list.content = matchAndRemoveMovie(list.content, imdbID, tmdbId);

        if (list.content.length === initialLength) {
            console.log("Movie not found. Searched for:", { imdbID, tmdbId });
            console.log("List content:", list.content.map(m => ({ id: m.id, imdbID: m.imdbID })));
            return res.status(404).json({ message: "Movie not found in the list" });
        }

        console.log(`Successfully removed ${initialLength - list.content.length} item(s)`);
        await list.save();

        return res.status(200).json({ message: "Movie removed from the list successfully" });

    } catch (error) {
        console.error("Error in removeFromList:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getList, addToList, removeFromList }
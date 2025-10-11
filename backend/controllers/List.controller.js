// const { response } = require("express");
const Lists = require("../models/List.model.js");
const List = require("../models/List.model.js");
const User = require("../models/User.model.js");
const getList = async(req, res, next) => {
    const { username, type } = req.params;
    try {
        const userCount = await User.find({ username }).countDocuments();
        if (userCount === 0) {
            return res.status(404).json({ message: "No such user exists" });
        }

        const list = await List.find({ ownerUsername: username, type });

        if (!list) {
            return res.status(404).json({ message: "Error finding list" });
        }

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
    console.log(req.body);
    const movieFetched = req.body.movie;
    const { username } = req.user;
    const listName = req.params.type === "watchlist" ? "watchlist" : movieFetched.listName;

    if (req.params.type !== "watchlist" && req.params.type !== "normal") {
        return res.status(400).json({ message: "WRONG TYPE ATTRIBUTE" });
    }

    // Prevent creating a custom list named 'watchlist'
    if (req.params.type === "normal" && listName && listName.toLowerCase() === "watchlist") {
        return res.status(400).json({ message: "Cannot create a custom list named 'watchlist'. This name is reserved." });
    }

    if (req.params.type === "normal" && !listName) {
        return res.status(400).json({ message: "LIST NAME SHOULD BE AVAILABLE" });
    }

    try {
        let list = await Lists.findOne({ name: listName, ownerUsername: username });

        if (!list) {
            // Only backend can create the watchlist
            if (listName === "watchlist" && req.params.type !== "watchlist") {
                return res.status(400).json({ message: "Cannot create a custom list named 'watchlist'. This name is reserved." });
            }
            list = new Lists({
                name: listName,
                type: req.params.type,
                ownerUsername: username,
                content: []
            });
        }

        if (movieFetched) {
            // Check if the movie already exists in the list based on imdbID or id
            const movieExists = list.content.some(movie => 
                (movieFetched.imdbID && movie.imdbID === movieFetched.imdbID) || 
                movie.id == movieFetched.id
            );
            if (movieExists) {
                return res.status(200).json({ message: "Movie already in the list" });
            }

            // Add the movie to the list
            list.content.push({
                id: movieFetched.id,
                posterLink: movieFetched.posterLink || movieFetched.poster_path,
                title: movieFetched.title,
                imdbID: movieFetched.imdbID
            });
        }

        await list.save();

        const message = movieFetched ?
            "Movie added to the list successfully" :
            "List created successfully";
        return res.status(200).json({ message });

    } catch (error) {
        console.error("Error in addToList:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const removeFromList = async(req, res, next) => {
    console.log("removeFromList called!");
    console.log("Body:", req.body);
    console.log("User:", req.user);
    console.log("Params:", req.params);
    
    const { imdbID, tmdbId } = req.body;
    const { username } = req.user;
    const { type } = req.params;

    if (!imdbID && !tmdbId) {
        return res.status(400).json({ message: "imdbID or tmdbId is required" });
    }

    try {
        const list = await Lists.findOne({ name: type, ownerUsername: username });

        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        // Remove the movie from the list based on imdbID OR tmdbId (for backward compatibility)
        const initialLength = list.content.length;
        
        list.content = list.content.filter(movie => {
            // 1. Try to match by tmdbId first (most reliable for backward compatibility)
            if (tmdbId && movie.id && movie.id.toString() === tmdbId.toString()) {
                console.log(`Matched by tmdbId: ${tmdbId}`);
                return false; // Remove this movie
            }
            
            // 2. Try to match by imdbID
            if (imdbID && movie.imdbID && movie.imdbID === imdbID) {
                console.log(`Matched by imdbID: ${imdbID}`);
                return false; // Remove this movie
            }
            
            // 3. For our fallback format (tv-2734 or movie-1234), extract and match
            if (imdbID && (imdbID.startsWith('tv-') || imdbID.startsWith('movie-'))) {
                const extractedId = imdbID.split('-')[1];
                if (movie.id && movie.id.toString() === extractedId) {
                    console.log(`Matched by extracted ID from ${imdbID}: ${extractedId}`);
                    return false; // Remove this movie
                }
            }
            
            // 4. If imdbID is a pure TMDB ID (numeric string), try matching directly
            if (imdbID && /^\d+$/.test(imdbID) && movie.id && movie.id.toString() === imdbID) {
                console.log(`Matched by numeric imdbID: ${imdbID}`);
                return false; // Remove this movie
            }
            
            return true; // Keep this movie
        });

        if (list.content.length === initialLength) {
            console.log("Movie not found. Searched for:", { imdbID, tmdbId });
            console.log("List content:", list.content.map(m => ({ id: m.id, imdbID: m.imdbID })));
            return res.status(404).json({ message: "Movie not found in the list" });
        }

        console.log(`Movie removed successfully. Removed ${initialLength - list.content.length} item(s)`);
        await list.save();

        return res.status(200).json({ message: "Movie removed from the list successfully" });

    } catch (error) {
        console.error("Error in removeFromList:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getList, addToList, removeFromList }
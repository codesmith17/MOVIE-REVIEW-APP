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

    if (req.params.type === "normal" && !listName) {
        return res.status(400).json({ message: "LIST NAME SHOULD BE AVAILABLE" });
    }

    try {
        let list = await Lists.findOne({ name: listName, ownerUsername: username });

        if (!list) {
            // If the list does not exist, create it
            list = new Lists({
                name: listName,
                type: req.params.type,
                ownerUsername: username,
                content: []
            });
        }

        if (movieFetched.movie) {
            // Check if the movie already exists in the list based on id
            const movieExists = list.content.some(movie => movie.id == movieFetched.id);
            if (movieExists) {
                return res.status(200).json({ message: "Movie already in the list" });
            }

            // Add the movie to the list
            list.content.push({
                id: movieFetched.id,
                posterLink: movieFetched.poster_path,
                title: movieFetched.title
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

// module.exports = addToList;








module.exports = { getList, addToList }
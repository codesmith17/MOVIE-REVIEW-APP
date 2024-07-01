const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();
const process = require("process");

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true
}));

const port = process.env.PORT || 3000;
const authRoutes = require("./routes/Auth.route");
const reviewRoutes = require("./routes/Review.route");
const movieRoutes = require("./routes/Movie.route");
const commentRoutes = require("./routes/Comment.route");

mongoose.connect("mongodb+srv://krishna170902:44AueKgqHr2eDL8o@clusteracademind.ub2btq6.mongodb.net/movies-app?retryWrites=true&w=majority&appName=ClusterAcademind")
    .then(result => {
        console.log("CONNECTED");
        app.listen(port, () => console.log(`Dolphin app listening on port ${port}!`));
    })
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/comment", commentRoutes);
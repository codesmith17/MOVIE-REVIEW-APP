const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();
const process = require("process");
require('dotenv').config();
// const http = require('http');
// const socketIo = require('socket.io');
// const { Server } = require("socket.io");
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true
}));

const port = process.env.PORT || 3000;

// Create an HTTP server using the Express app


const authRoutes = require("./routes/Auth.route");
const reviewRoutes = require("./routes/Review.route");
const movieRoutes = require("./routes/Movie.route");
const commentRoutes = require("./routes/Comment.route");
const listRoutes = require("./routes/List.route");

mongoose.connect("mongodb://localhost:27017/movies-app", {
        family: 4,
    })
    .then(result => {
        console.log("CONNECTED");
        // Start the server
        app.listen(port, () => console.log(`Dolphin app listening on port ${port}!`));
    })
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/list", listRoutes);

// // Video call room functionality

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "https://29lgn497-5173.euw.devtunnels.ms"], // Your React app's URL
//         methods: ["GET", "POST"],
//     },
// });

// const emailToSocketIdMap = new Map();
// const socketidToEmailMap = new Map();

// io.on("connection", (socket) => {
//     console.log(`Socket Connected`, socket.id);
//     socket.on("room:join", (data) => {
//         const { email, room } = data;
//         emailToSocketIdMap.set(email, socket.id);
//         socketidToEmailMap.set(socket.id, email);
//         io.to(room).emit("user:joined", { email, id: socket.id });
//         socket.join(room);
//         io.to(socket.id).emit("room:join", data);
//     });

//     socket.on("user:call", ({ to, offer }) => {
//         io.to(to).emit("incomming:call", { from: socket.id, offer });
//     });

//     socket.on("call:accepted", ({ to, ans }) => {
//         io.to(to).emit("call:accepted", { from: socket.id, ans });
//     });

//     socket.on("peer:nego:needed", ({ to, offer }) => {
//         console.log("peer:nego:needed", offer);
//         io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//     });

//     socket.on("peer:nego:done", ({ to, ans }) => {
//         console.log("peer:nego:done", ans);
//         io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//     });
// });
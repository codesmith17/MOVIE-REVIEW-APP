const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const process = require("process");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
// Use native fetch in Node 18+ or fall back to node-fetch
const fetch =
  globalThis.fetch ||
  ((...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args)));

app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://cine-critique-alpha.vercel.app"]
        : ["http://localhost:5173", "https://cine-critique-alpha.vercel.app"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Import routes
const authRoutes = require("./routes/Auth.route");
const reviewRoutes = require("./routes/Review.route");
const movieRoutes = require("./routes/Movie.route");
const commentRoutes = require("./routes/Comment.route");
const listRoutes = require("./routes/List.route");
// const subtitleRoutes = require('./routes/subtitleRoutes'); // Disabled for now

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log("Using cached database connection");
    return cachedDb;
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    const connection = await mongoose.connect(
      "mongodb+srv://krishna170902:44AueKgqHr2eDL8o@clusteracademind.ub2btq6.mongodb.net/movies-app?retryWrites=true&w=majority&appName=ClusterAcademind",
      {
        family: 4,
        serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for serverless cold starts
        socketTimeoutMS: 45000,
      },
    );
    console.log("MongoDB CONNECTED successfully");
    cachedDb = connection;
    return connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

app.use(bodyParser.urlencoded({ extended: false }));

// Health check route (no DB required) - MUST be before DB middleware
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV || "development",
  });
});

// Middleware to ensure DB connection before handling requests (after health check)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("DB connection middleware error:", err.message);
    res.status(500).json({
      error: "Database connection failed",
      message: "Unable to connect to database. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Basic root route (requires DB)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Movie Review API is running",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/list", listRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  connectToDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
}

// Export for Vercel serverless
module.exports = app;

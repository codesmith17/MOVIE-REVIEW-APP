const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const process = require("process");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const { sequelize, testConnection, syncDatabase } = require("./config/database");

// Use native fetch in Node 18+ or fall back to node-fetch
const fetch =
  globalThis.fetch ||
  ((...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)));

app.use(express.json());

// CORS - more permissive since frontend and backend are on same domain
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? true // Allow same origin
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Import routes
const authRoutes = require("./routes/Auth.route");
const reviewRoutes = require("./routes/Review.route");
const movieRoutes = require("./routes/Movie.route");
const commentRoutes = require("./routes/Comment.route");
const listRoutes = require("./routes/List.route");
const tmdbRoutes = require("./routes/Tmdb.route");

// YugabyteDB connection with caching for serverless
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    console.log("Using existing YugabyteDB connection");
    return sequelize;
  }

  try {
    console.log("Attempting to connect to YugabyteDB...");
    await testConnection();

    // Skip sync - tables already exist and are configured correctly
    // Syncing can cause issues when tables already have data and constraints
    // If you need to update schema, do it manually with migrations
    // if (process.env.NODE_ENV !== "production") {
    //   await syncDatabase();
    // }

    isConnected = true;
    console.log("YugabyteDB connected successfully");
    return sequelize;
  } catch (err) {
    console.error("YugabyteDB connection error:", err.message);
    throw err;
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // Parse cookies from Cookie header

// Health check route (no DB required) - MUST be first
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV || "development",
    database: "YugabyteDB",
  });
});

// API health check (with DB)
app.get("/api/health", async (req, res) => {
  try {
    await connectToDatabase();
    // Test query
    await sequelize.query("SELECT 1+1 AS result");

    res.json({
      status: "ok",
      message: "CineSphere API is running",
      timestamp: new Date().toISOString(),
      database: "YugabyteDB connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Middleware to ensure DB connection for API routes only
app.use("/api", async (req, res, next) => {
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

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/list", listRoutes);
app.use("/api/tmdb", tmdbRoutes);

// Serve static files from frontend build (AFTER API routes)
// In production (Vercel), use local dist; in development, use ../frontend/dist
const frontendPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "dist")
    : path.join(__dirname, "../frontend/dist");

// Serve static assets with proper fallback
app.use(
  express.static(frontendPath, {
    maxAge: "1d",
    etag: true,
  })
);

// SPA fallback - MUST come after static middleware
// This catches all non-API, non-static-file routes and serves index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).json({
        error: "Failed to serve application",
        message: err.message,
      });
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  connectToDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`YugabyteDB connection active`);
    });
  });
}

// Export for Vercel serverless
module.exports = app;

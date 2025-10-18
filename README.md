# CineSphere

**Your Ultimate Entertainment Companion**

CineSphere is a modern, full-stack web application that brings together movie enthusiasts to discover, review, and share their love for cinema. Built with cutting-edge technologies, it offers a seamless experience for exploring movies and TV shows, writing reviews, creating custom lists, and connecting with fellow cinephiles.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Authentication & Security](#authentication--security)
9. [Automation & Cron Jobs](#automation--cron-jobs)
10. [Deployment](#deployment)
11. [Project Structure](#project-structure)
12. [Contributing](#contributing)

---

## Overview

CineSphere is designed to be more than just another movie database. It's a social platform where users can:

- Discover trending movies and TV shows from a vast database powered by TMDB
- Write detailed reviews with rich text formatting
- Create and manage custom watchlists and movie collections
- Follow other users and see what they're watching
- Engage through comments and likes on reviews
- Track their viewing activity and statistics
- Search across movies, TV shows, and people

The application features a beautiful, responsive interface with smooth animations, dominant color extraction for movie cards, and an intuitive user experience across all devices.

---

## Key Features

### Content Discovery

**Browse and Search**
- Real-time search across movies, TV shows, and celebrities
- Trending content updated daily
- Now playing, upcoming, and top-rated movies
- Popular and on-the-air TV shows
- Person profiles with filmographies

**Movie and TV Show Pages**
- Comprehensive details including cast, crew, and ratings
- Official trailers and video content
- Watch provider information by region
- TMDB-powered recommendations
- IMDb integration for additional data

### User Experience

**Reviews and Ratings**
- Write rich-text reviews with a WYSIWYG editor
- Five-star rating system
- Edit and delete your reviews
- View reviews from other users
- Like and engage with reviews

**Lists and Collections**
- Create custom movie lists with descriptions
- Personal watchlist for tracking movies to watch
- Add or remove movies from any list
- Drag-and-drop ordering (upcoming feature)
- Public and private list visibility

**Social Features**
- User profiles with activity summaries
- Follow and unfollow other users
- See what friends are watching
- Followers and following lists
- Activity feed showing recent reviews and likes

**Comments and Engagement**
- Comment on reviews
- Reply to comments
- Like and dislike comments
- Nested conversation threads
- Real-time engagement

### Visual Design

**Modern Interface**
- Dark theme with vibrant accents
- Glassmorphism effects
- Smooth animations with Framer Motion
- Dominant color extraction from movie posters
- Lazy loading for optimal performance
- Responsive design for mobile, tablet, and desktop

---

## Technology Stack

### Frontend

**Core Framework**
- React 18.3 - Modern UI library with hooks
- Vite 5.4 - Lightning-fast build tool and dev server
- React Router 6.30 - Client-side routing

**State Management & Data**
- Redux Toolkit 2.9 - Centralized state management
- Axios 1.12 - HTTP client with interceptors
- React Query pattern for data fetching

**UI & Styling**
- TailwindCSS 3.4 - Utility-first CSS framework
- Framer Motion 11.18 - Animation library
- React Icons 5.5 - Comprehensive icon set
- DOMPurify 3.3 - XSS sanitization

**Rich Content**
- React Quill 2.0 - WYSIWYG text editor
- React Lazy Load Image - Performance optimization

**Additional Libraries**
- React Toastify - Toast notifications
- CryptoJS - Client-side encryption
- Class Variance Authority - Component variants

### Backend

**Core Framework**
- Node.js 18+ - JavaScript runtime
- Express.js 4.21 - Web application framework

**Database**
- YugabyteDB - Distributed PostgreSQL-compatible database
- Sequelize 6.37 - ORM for SQL databases
- pg 8.16 - PostgreSQL client for Node.js

**Authentication & Security**
- JSON Web Tokens (JWT) - Access and refresh tokens
- bcryptjs - Password hashing
- cookie-parser - Secure cookie handling
- Refresh token rotation for enhanced security

**External APIs**
- TMDB API - Movie and TV show data
- Google Generative AI - Recommendations
- Nodemailer - Email notifications
- Cheerio - Web scraping for IMDb data

**Cloud Services**
- Firebase Admin - User management
- Google Cloud Storage - File uploads

---

## Architecture

### System Design

CineSphere follows a modern three-tier architecture:

1. **Presentation Layer** (Frontend)
   - React-based SPA served through Vite
   - Redux for global state management
   - Axios interceptors for automatic token refresh
   - Component-based architecture for reusability

2. **Application Layer** (Backend)
   - RESTful API built with Express.js
   - JWT-based authentication with refresh tokens
   - Middleware for auth, validation, and error handling
   - Service layer for business logic
   - Controller layer for request handling

3. **Data Layer**
   - YugabyteDB for distributed SQL storage
   - Sequelize ORM for database operations
   - Optimized queries with indexing
   - JSONB fields for flexible schema

### Security Architecture

**Token-Based Authentication**
- Access tokens (15 minutes expiry) for API requests
- Refresh tokens (7 days expiry) for token renewal
- HTTP-only cookies to prevent XSS attacks
- Secure and SameSite flags for CSRF protection
- Token rotation on each refresh

**Data Protection**
- Password hashing with bcrypt (10 rounds)
- Parameterized queries to prevent SQL injection
- Input sanitization and validation
- CORS configuration for cross-origin requests
- Rate limiting on sensitive endpoints

**Environment Variables**
- Sensitive data stored in environment variables
- Separate configurations for development and production
- Secret rotation capability through automated scripts

### API Proxy Pattern

The backend serves as a secure proxy for TMDB API calls, keeping the API token server-side and preventing exposure to clients.

---

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- YugabyteDB cluster (local or cloud)
- TMDB API key (free from themoviedb.org)

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Database Configuration
YUGABYTE_HOST=your-yugabyte-host
YUGABYTE_PORT=5433
YUGABYTE_DB=cinesphere
YUGABYTE_USER=your-username
YUGABYTE_PASSWORD=your-password
YUGABYTE_CA_CERT=your-ca-certificate-content

# Authentication
JWT_SECRET=your-secure-jwt-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret
CRYPTO_SECRET=your-crypto-secret

# External APIs
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
GOOGLE_AI_API_KEY=your-google-ai-key

# Email Configuration
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend` directory:

```bash
VITE_BACKEND_BASE_URL=http://localhost:3000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cinesphere.git
   cd cinesphere
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Set up the database**
   
   Ensure your YugabyteDB cluster is running and accessible. The application will automatically create tables on first run.

6. **Start the development servers**

   Backend (from backend directory):
   ```bash
   npm run dev
   ```

   Frontend (from frontend directory):
   ```bash
   npm run dev
   ```

7. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/signup**
Register a new user account.

Request Body:
```json
{
  "form": {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
  },
  "checked": true
}
```

Response:
```json
{
  "message": "User registered and logged in successfully.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**POST /api/auth/signin**
Authenticate a user and receive tokens.

Request Body:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "message": "Authentication successful.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**POST /api/auth/refresh-token**
Refresh an expired access token using the refresh token cookie.

Response:
```json
{
  "message": "Token refreshed successfully"
}
```

**GET /api/auth/verify**
Verify if the current access token is valid (requires authentication).

**GET /api/auth/getUserData**
Get current authenticated user's data (requires authentication).

**POST /api/auth/forgotPassword**
Request a password reset email.

Request Body:
```json
{
  "email": "john@example.com"
}
```

**POST /api/auth/resetPassword**
Reset password using the token from email.

Request Body:
```json
{
  "resetToken": "token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**POST /api/auth/toggleFollow/:username**
Follow or unfollow a user (requires authentication).

**GET /api/auth/getFollowers/:username**
Get list of users following the specified user.

**GET /api/auth/getFollowing/:username**
Get list of users that the specified user follows.

**GET /api/auth/getOthersData/:username**
Get public profile data for a specific user.

### Movie & TV Show Endpoints

**GET /api/tmdb/search/movie**
Search for movies by title.

Query Parameters:
- `query` (required) - Search term
- `page` (optional) - Page number (default: 1)

**GET /api/tmdb/search/multi**
Search across movies, TV shows, and people.

Query Parameters:
- `query` (required) - Search term
- `page` (optional) - Page number (default: 1)

**GET /api/tmdb/trending/:mediaType/:timeWindow**
Get trending content.

Parameters:
- `mediaType` - "movie", "tv", or "all"
- `timeWindow` - "day" or "week"

Query Parameters:
- `page` (optional) - Page number (default: 1)

**GET /api/tmdb/movie/:category**
Get movie lists by category.

Categories:
- `now_playing` - Movies currently in theaters
- `popular` - Popular movies
- `upcoming` - Upcoming releases
- `top_rated` - Top-rated movies

**GET /api/tmdb/tv/:category**
Get TV show lists by category.

Categories:
- `popular` - Popular TV shows
- `on_the_air` - Currently airing shows
- `top_rated` - Top-rated shows
- `airing_today` - Shows airing today

**GET /api/tmdb/:mediaType/:id**
Get detailed information for a specific movie or TV show.

Parameters:
- `mediaType` - "movie" or "tv"
- `id` - TMDB ID

**GET /api/tmdb/:mediaType/:id/credits**
Get cast and crew information.

**GET /api/tmdb/:mediaType/:id/videos**
Get trailers and video content.

**GET /api/tmdb/:mediaType/:id/providers**
Get streaming service availability by region.

**GET /api/tmdb/:mediaType/:id/recommendations**
Get recommended similar content.

**GET /api/tmdb/person/:id**
Get detailed person information including filmography.

**GET /api/tmdb/find/:imdbId**
Find content by IMDb ID.

### Movie Interaction Endpoints

**POST /api/movie/postLikes**
Like or unlike a movie (requires authentication).

Request Body:
```json
{
  "imdbID": "tt1234567"
}
```

**GET /api/movie/getLikes/:imdbID**
Get like count and status for a movie.

**GET /api/movie/getLikedMoviesCount/:username**
Get count of movies liked by a user.

**GET /api/movie/getTrending**
Get trending movies (legacy endpoint).

**GET /api/movie/getRecos/:imdbID/:title/:year**
Get AI-powered movie recommendations.

**GET /api/movie/getImdb/:imdbID**
Scrape additional data from IMDb.

### Review Endpoints

**POST /api/review/postReview**
Create a new review (requires authentication).

Request Body:
```json
{
  "imdbID": "tt1234567",
  "reviewText": "<p>This movie was amazing...</p>",
  "rating": 4.5
}
```

**GET /api/review/getPersonalReview/:imdbID**
Get the authenticated user's review for a movie (requires authentication).

**GET /api/review/getReviewById/:imdbID/:reviewID**
Get a specific review by ID.

**GET /api/review/getOtherReviews/:imdbID/:reviewID?**
Get all reviews for a movie, optionally excluding a specific review.

**PUT /api/review/updateReview/:reviewID**
Update an existing review (requires authentication).

Request Body:
```json
{
  "reviewText": "<p>Updated review text...</p>",
  "rating": 5
}
```

**DELETE /api/review/deleteReview/:reviewID**
Delete a review (requires authentication).

**POST /api/review/postReviewLikes**
Like or unlike a review (requires authentication).

Request Body:
```json
{
  "reviewId": "review-uuid"
}
```

**GET /api/review/getReviews/:username**
Get all reviews by a specific user.

**GET /api/review/getLikedReviews/:username**
Get all reviews liked by a specific user.

**POST /api/review/upsertRating**
Create or update a rating without a review (requires authentication).

Request Body:
```json
{
  "imdbID": "tt1234567",
  "rating": 4
}
```

**GET /api/review/getRating**
Get the authenticated user's rating for a movie (requires authentication).

### List Management Endpoints

**GET /api/list/getList/:username/:type**
Get lists for a user.

Parameters:
- `username` - User's username
- `type` - "watchlist" or "normal"

**GET /api/list/getListById/:listId**
Get a specific list by its ID.

**POST /api/list/addToList/:type**
Add a movie to a list or create a new list (requires authentication).

Parameters:
- `type` - "watchlist" or "normal"

Request Body:
```json
{
  "movie": {
    "id": 550,
    "title": "Fight Club",
    "posterLink": "https://image.tmdb.org/t/p/w500/poster.jpg",
    "imdbID": "tt0137523",
    "mediaType": "movie",
    "listName": "My Favorites",
    "listDescription": "Collection of my all-time favorites"
  }
}
```

**DELETE /api/list/removeFromList/:listId/:movieId**
Remove a specific movie from a list (requires authentication).

**DELETE /api/list/deleteList/:listId**
Delete an entire list (requires authentication, cannot delete watchlist).

### Comment Endpoints

**POST /api/comment/postComment**
Add a comment to a review (requires authentication).

Request Body:
```json
{
  "reviewID": "review-uuid",
  "commentText": "Great review!"
}
```

**GET /api/comment/getCommentsByReviewId/:reviewID**
Get all comments for a specific review.

**POST /api/comment/likeComment**
Like a comment (requires authentication).

Request Body:
```json
{
  "commentId": "comment-uuid"
}
```

**POST /api/comment/dislikeComment**
Dislike a comment (requires authentication).

**POST /api/comment/postReply**
Reply to a comment (requires authentication).

Request Body:
```json
{
  "commentId": "comment-uuid",
  "replyText": "I agree with your point!"
}
```

**POST /api/comment/likeReply**
Like a reply (requires authentication).

**DELETE /api/comment/deleteComment/:commentID**
Delete a comment (requires authentication).

**DELETE /api/comment/deleteReply**
Delete a reply (requires authentication).

Request Body:
```json
{
  "commentId": "comment-uuid",
  "replyId": "reply-uuid"
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profilePicture TEXT,
  bio TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  imdbID VARCHAR(50) NOT NULL,
  userEmail VARCHAR(255) REFERENCES users(email),
  username VARCHAR(255) REFERENCES users(username),
  reviewText TEXT NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  likedBy TEXT[] DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Movies Table
```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY,
  imdbID VARCHAR(50) UNIQUE NOT NULL,
  likes INTEGER DEFAULT 0,
  emails TEXT[] DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Lists Table
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'normal',
  content JSONB DEFAULT '[]',
  likes INTEGER DEFAULT 0,
  isPublic BOOLEAN DEFAULT false,
  ownerUsername VARCHAR(255) REFERENCES users(username),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, ownerUsername)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  reviewID UUID REFERENCES reviews(id),
  userEmail VARCHAR(255) REFERENCES users(email),
  username VARCHAR(255) REFERENCES users(username),
  commentText TEXT NOT NULL,
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  replies JSONB DEFAULT '[]',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication & Security

### Token Flow

1. **Initial Authentication**
   - User provides credentials
   - Backend validates and generates tokens
   - Access token (15 min) and refresh token (7 days) sent as HTTP-only cookies
   - User info stored in Redux

2. **API Requests**
   - Access token automatically sent with each request via cookie
   - Backend middleware verifies token
   - Request proceeds if valid

3. **Token Refresh**
   - When access token expires (401 response)
   - Frontend interceptor catches error
   - Automatically calls refresh endpoint with refresh token cookie
   - New tokens issued and stored
   - Original request retried

4. **Token Rotation**
   - Each refresh generates new access and refresh tokens
   - Old tokens invalidated
   - Prevents token replay attacks

### Security Best Practices

**Password Security**
- Minimum 8 characters required
- Hashed using bcrypt with salt rounds
- Never stored in plain text
- Password reset via secure email token

**Cookie Configuration**
- HTTP-only flag prevents JavaScript access
- Secure flag ensures HTTPS-only transmission in production
- SameSite attribute prevents CSRF attacks
- Different paths for access and refresh tokens

**API Security**
- Rate limiting on authentication endpoints
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection with DOMPurify
- CORS configuration for allowed origins

**Environment Security**
- Sensitive data in environment variables
- Separate configs for dev/prod
- Certificate-based database connections
- API keys never exposed to client

---

## Automation & Cron Jobs

### TMDB Data Cache System

CineSphere includes an intelligent caching system that fetches and stores all TMDB data (movies and TV shows) in the database three times daily. This dramatically reduces TMDB API calls, improves homepage load times, and ensures fresh content throughout the day.

**How It Works**

1. **Automated Fetching**: GitHub Actions runs a cron job 3x daily (2 AM, 10 AM, 6 PM UTC)
2. **Database Caching**: All fetched data is stored in a public `tmdb_cache` table
3. **Cache-First Strategy**: API endpoints check the database cache first (12-hour expiration)
4. **Fallback to TMDB**: If cache misses or is stale, the system fetches from TMDB API
5. **Token Savings**: Homepage loads from cached data, saving TMDB API tokens

**Cached Content Categories**

Movies:
- Trending (daily and weekly)
- Popular
- Now Playing
- Upcoming
- Top Rated

TV Shows:
- Trending (daily and weekly)
- Popular
- On The Air
- Top Rated
- Airing Today

**GitHub Actions Workflow**

File: `.github/workflows/cache-tmdb-data.yml`

```yaml
name: Cache TMDB Data

on:
  schedule:
    # Run three times daily: 2:00 AM, 10:00 AM, and 6:00 PM UTC
    - cron: '0 2 * * *'   # 2:00 AM UTC
    - cron: '0 10 * * *'  # 10:00 AM UTC
    - cron: '0 18 * * *'  # 6:00 PM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  cache-tmdb-data:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
      
      - name: Fetch and cache TMDB data
        env:
          YUGABYTE_HOST: ${{ secrets.YUGABYTE_HOST }}
          YUGABYTE_PORT: ${{ secrets.YUGABYTE_PORT }}
          YUGABYTE_DB: ${{ secrets.YUGABYTE_DB }}
          YUGABYTE_USER: ${{ secrets.YUGABYTE_USER }}
          YUGABYTE_PASSWORD: ${{ secrets.YUGABYTE_PASSWORD }}
          YUGABYTE_CA_CERT: ${{ secrets.YUGABYTE_CA_CERT }}
          TMDB_BEARER_TOKEN: ${{ secrets.TMDB_BEARER_TOKEN }}
        run: |
          cd backend
          node scripts/fetch-tmdb-data.js
```

**Data Fetcher Script**

File: `backend/scripts/fetch-tmdb-data.js`

This script fetches all homepage data from TMDB and stores it in the database:

```javascript
const { sequelize } = require('../config/database');

async function fetchAndCacheAllData() {
  try {
    console.log('Starting TMDB data cache job...');
    
    // Create cache table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tmdb_cache (
        cache_key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        cached_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Fetch Movies
    await fetchAndStore('trending_movies_day', '/trending/movie/day');
    await fetchAndStore('trending_movies_week', '/trending/movie/week');
    await fetchAndStore('popular_movies', '/movie/popular');
    await fetchAndStore('now_playing_movies', '/movie/now_playing');
    await fetchAndStore('upcoming_movies', '/movie/upcoming');
    await fetchAndStore('top_rated_movies', '/movie/top_rated');
    
    // Fetch TV Shows
    await fetchAndStore('trending_tv_day', '/trending/tv/day');
    await fetchAndStore('trending_tv_week', '/trending/tv/week');
    await fetchAndStore('popular_tv', '/tv/popular');
    await fetchAndStore('on_the_air_tv', '/tv/on_the_air');
    await fetchAndStore('top_rated_tv', '/tv/top_rated');
    await fetchAndStore('airing_today_tv', '/tv/airing_today');
    
    console.log('TMDB data cached successfully');
    
  } catch (error) {
    console.error('Error caching TMDB data:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fetchAndCacheAllData();
```

**Cache Table Schema**

```sql
CREATE TABLE IF NOT EXISTS tmdb_cache (
  cache_key VARCHAR(100) PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW()
);
```

**Cache Keys**
- `trending_movies_day`, `trending_movies_week`
- `popular_movies`, `now_playing_movies`, `upcoming_movies`, `top_rated_movies`
- `trending_tv_day`, `trending_tv_week`
- `popular_tv`, `on_the_air_tv`, `top_rated_tv`, `airing_today_tv`

**Cache-First Controller Implementation**

File: `backend/controllers/Tmdb.controller.js`

The controller automatically checks cache before calling TMDB API:

```javascript
const CACHE_EXPIRATION_HOURS = 12;

async function getCachedData(cacheKey) {
  const result = await sequelize.query(`
    SELECT data, cached_at 
    FROM tmdb_cache 
    WHERE cache_key = :cacheKey
    AND cached_at > NOW() - INTERVAL '${CACHE_EXPIRATION_HOURS} hours'
  `, {
    replacements: { cacheKey },
    type: sequelize.QueryTypes.SELECT,
  });
  
  if (result && result.length > 0) {
    console.log(`Cache HIT for key: ${cacheKey}`);
    return result[0].data;
  }
  
  return null; // Cache miss - will fetch from TMDB
}

// Example: getTrending controller
const getTrending = async (req, res) => {
  const { mediaType, timeWindow } = req.params;
  const { page = 1 } = req.query;
  
  // Check cache for page 1 (homepage data)
  if (page == 1) {
    const cacheKey = `trending_${mediaType}_${timeWindow}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json({ results: cachedData, page: 1 });
    }
  }
  
  // Cache miss - fetch from TMDB API
    // ... existing logic
  } catch (error) {
    console.error('Error fetching trending:', error);
    res.status(500).json({ message: "Unable to fetch trending movies" });
  }
};
```

**Cache Update Schedule**

The workflow runs at these times (UTC):
- **2:00 AM** - Morning update for early users
- **10:00 AM** - Mid-day update for peak traffic
- **6:00 PM** - Evening update for night viewers

This ensures content is always fresh and reduces load on TMDB API.

### Additional Automation Ideas

**1. Weekly Activity Digest Email**
Send users a summary of their activity and what their friends watched.

**2. Content Cleanup Job**
Remove old, inactive user sessions and expired tokens.

**3. Recommendation Cache Update**
Pre-compute personalized recommendations for active users.

**4. Database Backup**
Automated daily backups to cloud storage.

**5. Analytics Collection**
Aggregate usage statistics for insights.

---

## Deployment

### Vercel Deployment

CineSphere is optimized for deployment on Vercel with a monolithic structure where the backend serves the frontend.

**Important: Vercel Project Settings**

Before deploying, configure these settings in your Vercel project dashboard:

1. **Root Directory**: Set to `backend` (critical for proper dependency installation)
2. **Framework Preset**: Other
3. **Build Command**: Leave as default or use `npm run vercel-build`
4. **Install Command**: `npm install`
5. **Output Directory**: Leave empty (backend serves static files)

**Configuration** (`backend/vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "index.js"
    },
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "cd ../frontend && npm install && npm run build"
}
```

**Deployment Steps**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - **Important:** In project settings, set Root Directory to `backend`

3. **Configure environment variables**
   Add all required environment variables in Vercel dashboard (see below).

4. **Deploy**
   - Click "Deploy" or push to your repository
   - Vercel will automatically:
     - Install backend dependencies (including `pg` and `sequelize`)
     - Build the frontend
     - Deploy the backend to serve everything

**Troubleshooting**

If you get "Please install pg package manually" error:
1. Verify Root Directory is set to `backend` in Vercel settings
2. Check that `pg` is in `backend/package.json` dependencies (not devDependencies)
3. Redeploy after fixing settings

### Environment Variables for Production

Ensure all these variables are set in Vercel:

**Database Configuration**
- `YUGABYTE_HOST` - Your YugabyteDB cluster host
- `YUGABYTE_PORT` - Database port (usually 5433)
- `YUGABYTE_DB` - Database name (e.g., cinesphere)
- `YUGABYTE_USER` - Database username
- `YUGABYTE_PASSWORD` - Database password
- `YUGABYTE_CA_CERT` - Certificate content with escaped newlines (see below)

**Authentication & Security**
- `JWT_SECRET` - Secret for access tokens
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens
- `CRYPTO_SECRET` - Encryption secret

**External APIs**
- `TMDB_BEARER_TOKEN` - TMDB API bearer token

**Application**
- `NODE_ENV=production`

**Setting the Certificate in Vercel**

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new variable named `YUGABYTE_CA_CERT`
4. For the value, use your certificate content with escaped newlines:

```bash
# Convert certificate file to environment variable format:
cat root.crt | awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}'
```

The output should look like:
```
-----BEGIN CERTIFICATE-----\nMIIDrzCCA...\n-----END CERTIFICATE-----\n
```

5. Save the variable

The application will automatically use this certificate for SSL connections to YugabyteDB.

### Database Migration

For production deployment:

1. Ensure YugabyteDB cluster is provisioned
2. Run initial schema creation
3. Set up SSL certificates for secure connections
4. Configure connection pooling
5. Enable query caching

---

## Project Structure

```
cinesphere/
├── backend/
│   ├── config/
│   │   └── database.js              # Database configuration
│   ├── controllers/
│   │   ├── Auth.controller.js       # Authentication logic
│   │   ├── Comment.controller.js    # Comment operations
│   │   ├── List.controller.js       # List management
│   │   ├── Movie.controller.js      # Movie interactions
│   │   ├── Review.controller.js     # Review operations
│   │   └── Tmdb.controller.js       # TMDB API proxy
│   ├── models/
│   │   ├── Comment.model.js         # Comment schema
│   │   ├── List.model.js            # List schema
│   │   ├── Movie.model.js           # Movie schema
│   │   ├── Review.model.js          # Review schema
│   │   └── User.model.js            # User schema
│   ├── routes/
│   │   ├── Auth.route.js            # Auth endpoints
│   │   ├── Comment.route.js         # Comment endpoints
│   │   ├── List.route.js            # List endpoints
│   │   ├── Movie.route.js           # Movie endpoints
│   │   ├── Review.route.js          # Review endpoints
│   │   └── Tmdb.route.js            # TMDB endpoints
│   ├── services/
│   │   └── TmdbService.js           # TMDB API service
│   ├── scripts/
│   │   ├── fetch-trending.js        # Trending movies cron
│   │   └── rotate-secrets.js        # Secret rotation
│   ├── utils/
│   │   ├── firebaseAdmin.js         # Firebase config
│   │   ├── Graph.js                 # Social graph logic
│   │   └── GeminiApiReccomendations.js  # AI recommendations
│   └── index.js                     # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── activity/            # Activity components
│   │   │   ├── auth/                # Auth forms
│   │   │   ├── common/              # Shared components
│   │   │   ├── features/            # Redux slices
│   │   │   ├── layout/              # Layout components
│   │   │   ├── modals/              # Modal dialogs
│   │   │   ├── movie/               # Movie components
│   │   │   ├── pages/               # Page components
│   │   │   ├── reviews/             # Review components
│   │   │   └── user/                # User components
│   │   ├── styles/
│   │   │   ├── quill-dark.css       # Editor dark theme
│   │   │   ├── theme.js             # Design system
│   │   │   └── utilities.css        # Utility classes
│   │   ├── utils/
│   │   │   ├── axiosConfig.js       # Axios setup
│   │   │   └── GeminiApiReccomendations.js
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/
│   │   └── assets/                  # Static assets
│   └── index.html                   # HTML template
│
├── .github/
│   └── workflows/
│       └── trending-movies.yml      # Cron job workflow
│
├── package.json                     # Root package file
└── README.md                        # This file
```

---

## Contributing

We welcome contributions to CineSphere. Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run format
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use ES6+ features
- Follow Airbnb JavaScript style guide
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

### Testing

Before submitting a PR:
- Test all modified features
- Ensure no console errors
- Check responsive design
- Verify accessibility
- Test with different browsers

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

Built with love for cinema enthusiasts everywhere.

**Data Sources**
- TMDB (The Movie Database) for comprehensive movie and TV data
- IMDb for additional movie information
- Google Generative AI for intelligent recommendations

**Technologies**
- React team for the amazing framework
- Vercel for seamless deployment
- YugabyteDB for distributed SQL capabilities
- All open-source contributors

---

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Join our community discussions
- Check the documentation in the `/docs` folder

---

**CineSphere** - Where stories come alive, and communities unite through the magic of cinema.


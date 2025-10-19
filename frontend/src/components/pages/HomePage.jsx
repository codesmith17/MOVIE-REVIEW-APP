import { useState, useEffect } from "react";
import { MovieSection } from "../movie";
import { MovieLoader } from "../common";
import { FaStar, FaPlus, FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../utils/axiosConfig";

const HomePage = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMoviesByDay, setTrendingMoviesByDay] = useState(null);
  const [trendingMoviesByWeek, setTrendingMoviesByWeek] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [latestShows, setLatestShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [onTheAirShows, setOnTheAirShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [regionalMovies, setRegionalMovies] = useState([]);
  const [regionalTV, setRegionalTV] = useState([]);
  const [userRegion, setUserRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState(null);

  const user = useSelector((state) => state.user.data);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Fetch movies/TV shows from backend using axios
     * Note: Backend uses cache-first strategy, so this will load from database cache
     * when available (12-hour expiration), falling back to TMDB API only on cache miss.
     * This dramatically improves load times and saves TMDB API tokens.
     */
    const fetchMovies = async (endpoint, setMovies, isTrending = false) => {
      try {
        const { data } = await axios.get(endpoint);

        // Log cache usage with detailed status
        const cacheStatus = data.cache_status;
        if (cacheStatus?.is_cached) {
          console.log(
            `🟢 [CACHED] ${endpoint} - Age: ${cacheStatus.cache_age_hours}h (cached at: ${new Date(cacheStatus.cached_at).toLocaleString()})`
          );
        } else {
          console.log(`🔴 [TMDB API] ${endpoint} - Fresh data from TMDB`);
        }

        setMovies(data.results.slice(0, 10));

        // Set hero movie from trending
        if (isTrending && data.results.length > 0) {
          setHeroMovie(data.results[0]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.response?.data?.message || error.message);
      }
    };

    const fetchAllMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all homepage data in parallel
        // These endpoints use cached data from the database (updated 3x daily via cron job)
        await Promise.all([
          fetchMovies("/api/tmdb/trending/movie/day", setTrendingMoviesByDay, true),
          fetchMovies("/api/tmdb/trending/movie/week", setTrendingMoviesByWeek),
          fetchMovies("/api/tmdb/movie/now_playing", setNowPlayingMovies),
          fetchMovies("/api/tmdb/movie/popular", setPopularMovies),
          fetchMovies("/api/tmdb/movie/upcoming", setUpcomingMovies),
          fetchMovies("/api/tmdb/movie/top_rated", setTopRatedMovies),
          fetchMovies("/api/tmdb/tv/popular", setLatestShows),
          fetchMovies("/api/tmdb/trending/tv/day", setTrendingShows),
          fetchMovies("/api/tmdb/tv/on_the_air", setOnTheAirShows),
          fetchMovies("/api/tmdb/tv/top_rated", setTopRatedShows),
          // Fetch regional content (auto-detects user's location)
          (async () => {
            try {
              const { data } = await axios.get("/api/tmdb/region/movies");

              // Log cache status for regional movies
              const cacheStatus = data.cache_status;
              if (cacheStatus?.is_cached) {
                console.log(
                  `🟢 [CACHED] /api/tmdb/region/movies - Age: ${cacheStatus.cache_age_hours}h (cached at: ${new Date(cacheStatus.cached_at).toLocaleString()})`
                );
              } else {
                console.log(`🔴 [TMDB API] /api/tmdb/region/movies - Fresh data from TMDB`);
              }

              setRegionalMovies(data.results.slice(0, 10));
              if (data.region) setUserRegion(data.region);
            } catch (error) {
              console.error("Error fetching regional movies:", error);
            }
          })(),
          (async () => {
            try {
              const { data } = await axios.get("/api/tmdb/region/tv");

              // Log cache status for regional TV
              const cacheStatus = data.cache_status;
              if (cacheStatus?.is_cached) {
                console.log(
                  `🟢 [CACHED] /api/tmdb/region/tv - Age: ${cacheStatus.cache_age_hours}h (cached at: ${new Date(cacheStatus.cached_at).toLocaleString()})`
                );
              } else {
                console.log(`🔴 [TMDB API] /api/tmdb/region/tv - Fresh data from TMDB`);
              }

              setRegionalTV(data.results.slice(0, 10));
            } catch (error) {
              console.error("Error fetching regional TV:", error);
            }
          })(),
        ]);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ All homepage data loaded successfully (cache-first strategy)");
        }
      } catch (error) {
        console.error("Error loading homepage data:", error);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  // Helper to map TV show fields
  const mapShows = (shows) =>
    shows &&
    shows.map((show) => ({
      ...show,
      title: show.name,
      release_date: show.first_air_date,
      media_type: "tv",
    }));

  // Fetch user's watchlist
  const fetchWatchlist = async () => {
    if (!user?.data?.username) return;

    try {
      const response = await axios.get(`/api/list/getList/${user.data.username}/watchlist`);

      if (response.data?.data && response.data.data[0]) {
        setWatchlist(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  // Check if hero movie is in watchlist
  useEffect(() => {
    if (heroMovie && watchlist) {
      const isInList = watchlist.content.some(
        (movie) => movie.id?.toString() === heroMovie.id?.toString()
      );
      setIsInWatchlist(isInList);
    }
  }, [heroMovie, watchlist]);

  // Fetch watchlist when user is available
  useEffect(() => {
    if (user?.data) {
      fetchWatchlist();
    }
  }, [user]);

  // Toggle Watchlist Handler (Add or Remove)
  const handleToggleWatchlist = async () => {
    if (!user) {
      toast.error("Please login to manage your watchlist");
      navigate("/login");
      return;
    }

    if (!heroMovie || addingToWatchlist) return;

    setAddingToWatchlist(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await axios.post("/api/list/removeFromList/watchlist", {
          imdbID: `movie-${heroMovie.id}`,
          tmdbId: heroMovie.id,
        });

        toast.success("Removed from watchlist!");
        setIsInWatchlist(false);
        await fetchWatchlist(); // Refresh watchlist
      } else {
        // Add to watchlist
        const response = await axios.post("/api/list/addToList/watchlist", {
          movie: {
            id: heroMovie.id,
            title: heroMovie.title,
            posterLink: heroMovie.poster_path
              ? `https://image.tmdb.org/t/p/w500${heroMovie.poster_path}`
              : null,
            imdbID: `movie-${heroMovie.id}`,
            mediaType: heroMovie.media_type || "movie",
          },
        });

        toast.success(response.data.message || "Added to watchlist!");
        setIsInWatchlist(true);
        await fetchWatchlist(); // Refresh watchlist
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update watchlist. Please try again."
      );
    } finally {
      setAddingToWatchlist(false);
    }
  };

  // Show loader while initial data is loading
  if (loading && !heroMovie) {
    return <MovieLoader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative mb-20">
          {/* Hero container with proper aspect ratio */}
          <div
            className="relative w-full"
            style={{
              paddingTop: "56.25%",
              minHeight: "500px",
              maxHeight: "70vh",
            }}
          >
            {/* Background Image - no cropping, contained properly */}
            <div className="absolute inset-0">
              <div className="w-full h-full relative">
                <img
                  src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
                  alt={heroMovie.title}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
                {/* Immersive gradient overlays - subtle and smooth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-[#0a0e27]/40 via-50% to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e27]/50 via-transparent to-[#0a0e27]/50" />
              </div>
            </div>

            {/* Hero Content - centered overlay */}
            <div className="absolute inset-0 flex items-center justify-center pt-20 pb-12">
              <div className="container-modern max-w-5xl mx-auto text-center px-4">
                <div className="fade-in space-y-6">
                  {/* Badges */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="badge badge-primary text-xs px-3 py-1.5">Trending Now</span>
                    {heroMovie.vote_average && (
                      <span className="badge badge-warning text-xs px-3 py-1.5 flex items-center gap-1.5">
                        <FaStar className="text-xs" />
                        {heroMovie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight drop-shadow-2xl px-4">
                    {heroMovie.title}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed line-clamp-2 md:line-clamp-3 max-w-4xl mx-auto px-4 drop-shadow-lg">
                    {heroMovie.overview}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <a
                      href={`/movie/${heroMovie.id}`}
                      className="btn-primary px-5 py-2 text-sm font-semibold"
                    >
                      View Details
                    </a>
                    <button
                      onClick={handleToggleWatchlist}
                      disabled={addingToWatchlist}
                      className={`px-5 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-300 rounded-lg ${
                        isInWatchlist ? "bg-red-600 hover:bg-red-700 text-white" : "btn-ghost"
                      } ${addingToWatchlist ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {addingToWatchlist ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          {isInWatchlist ? "Removing..." : "Adding..."}
                        </>
                      ) : isInWatchlist ? (
                        <>
                          <FaCheck />
                          In Watchlist
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          Add to Watchlist
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smooth fade to background - minimal interference */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0e27] to-transparent pointer-events-none" />
        </div>
      )}

      {/* Main Content */}
      <div className="py-8 relative">
        <div className="container-modern max-w-[1400px] mx-auto">
          {/* Quick Stats - Removed for cleaner look */}

          {/* Movie Sections */}
          <div className="space-y-16">
            {/* Regional Section - Show first if available */}
            {regionalMovies && regionalMovies.length > 0 && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📍</span>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      <span className="gradient-text">Trending Near You</span>
                      {userRegion && (
                        <span className="ml-3 text-sm font-normal text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
                          {userRegion}
                        </span>
                      )}
                    </h2>
                  </div>
                  <MovieSection
                    movies={regionalMovies}
                    loading={loading}
                    error={error}
                    hideTitle={true}
                  />
                </div>
              </div>
            )}

            <MovieSection
              title="Trending Movies Today"
              movies={trendingMoviesByDay}
              loading={loading}
              error={error}
            />

            <MovieSection
              title="Trending This Week"
              movies={trendingMoviesByWeek}
              loading={loading}
              error={error}
            />

            <MovieSection
              title="Now Playing"
              movies={nowPlayingMovies}
              loading={loading}
              error={error}
            />

            <MovieSection
              title="Popular Movies"
              movies={popularMovies}
              loading={loading}
              error={error}
            />

            <MovieSection
              title="Top Rated Movies"
              movies={topRatedMovies}
              loading={loading}
              error={error}
            />

            <MovieSection
              title="Coming Soon"
              movies={upcomingMovies}
              loading={loading}
              error={error}
            />

            {/* TV Shows Sections */}
            <div className="pt-16 mt-16 border-t border-gray-800/50">
              <h2 className="text-3xl font-bold gradient-text mb-12">TV Shows</h2>

              <div className="space-y-16">
                {/* Regional TV Shows */}
                {regionalTV && regionalTV.length > 0 && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50" />
                    <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">📺</span>
                        <h2 className="text-2xl md:text-3xl font-bold">
                          <span className="gradient-text">Popular Shows Near You</span>
                          {userRegion && (
                            <span className="ml-3 text-sm font-normal text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                              {userRegion}
                            </span>
                          )}
                        </h2>
                      </div>
                      <MovieSection
                        movies={mapShows(regionalTV)}
                        loading={loading}
                        error={error}
                        hideTitle={true}
                      />
                    </div>
                  </div>
                )}

                <MovieSection
                  title="Trending Shows"
                  movies={mapShows(trendingShows)}
                  loading={loading}
                  error={error}
                />

                <MovieSection
                  title="On The Air"
                  movies={mapShows(onTheAirShows)}
                  loading={loading}
                  error={error}
                />

                <MovieSection
                  title="Top Rated Shows"
                  movies={mapShows(topRatedShows)}
                  loading={loading}
                  error={error}
                />

                <MovieSection
                  title="Popular Shows"
                  movies={mapShows(latestShows)}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import { useState, useEffect } from "react";
import { MovieSection } from "../movie";
import { MovieLoader } from "../common";
import { FaFire, FaStar, FaTv, FaFilm, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState(null);

  const user = useSelector((state) => state.user.data);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async (url, setMovies) => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }

        const data = await response.json();
        setMovies(data.results.slice(0, 10));

        // Set hero movie from trending
        if (url.includes("trending/movie/day") && data.results.length > 0) {
          setHeroMovie(data.results[0]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      }
    };

    const fetchAllMovies = async () => {
      setLoading(true);
      await Promise.all([
        fetchMovies(
          "https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=1",
          setTrendingMoviesByDay
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/trending/movie/week?language=en-US&page=1",
          setTrendingMoviesByWeek
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
          setNowPlayingMovies
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
          setPopularMovies
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1",
          setUpcomingMovies
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
          setTopRatedMovies
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/tv/popular?language=en-US&page=1",
          setLatestShows
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=1",
          setTrendingShows
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1",
          setOnTheAirShows
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1",
          setTopRatedShows
        ),
      ]);
      setLoading(false);
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/list/getList/${user.data.username}/watchlist`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0]) {
          setWatchlist(data.data[0]);
        }
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
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/list/removeFromList/watchlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imdbID: `movie-${heroMovie.id}`,
              tmdbId: heroMovie.id,
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove from watchlist");
        }

        toast.success("Removed from watchlist!");
        setIsInWatchlist(false);
        await fetchWatchlist(); // Refresh watchlist
      } else {
        // Add to watchlist
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/list/addToList/watchlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              movie: {
                id: heroMovie.id,
                title: heroMovie.title,
                posterLink: heroMovie.poster_path,
                imdbID: `movie-${heroMovie.id}`,
              },
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add to watchlist");
        }

        const data = await response.json();
        toast.success(data.message || "Added to watchlist!");
        setIsInWatchlist(true);
        await fetchWatchlist(); // Refresh watchlist
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error(error.message || "Failed to update watchlist. Please try again.");
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

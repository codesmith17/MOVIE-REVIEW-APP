import { useState, useEffect, useRef } from "react";
import { MovieSection } from "../movie";
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
  const [locationTime, setLocationTime] = useState(null);

  // Individual loading states for progressive loading
  const [loadingStates, setLoadingStates] = useState({
    hero: true,
    trendingDay: true,
    trendingWeek: true,
    nowPlaying: true,
    popular: false, // Will load on scroll
    topRated: false,
    upcoming: false,
    regionalMovies: false,
    regionalTV: false,
    trendingShows: false,
    onTheAir: false,
    topRatedShows: false,
    popularShows: false,
  });

  // Track which sections have been fetched
  const [fetchedSections, setFetchedSections] = useState({
    hero: false,
    trendingDay: false,
    trendingWeek: false,
    nowPlaying: false,
    popular: false,
    topRated: false,
    upcoming: false,
    regionalMovies: false,
    regionalTV: false,
    trendingShows: false,
    onTheAir: false,
    topRatedShows: false,
    popularShows: false,
  });

  // Refs for Intersection Observer
  const popularRef = useRef(null);
  const topRatedRef = useRef(null);
  const upcomingRef = useRef(null);
  const regionalMoviesRef = useRef(null);
  const regionalTVRef = useRef(null);
  const trendingShowsRef = useRef(null);
  const onTheAirRef = useRef(null);
  const topRatedShowsRef = useRef(null);
  const popularShowsRef = useRef(null);

  const [heroMovie, setHeroMovie] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState(null);

  const user = useSelector((state) => state.user.data);
  const navigate = useNavigate();

  // Fetch function with error handling and loading state
  const fetchWithState = async (endpoint, setState, loadingKey, options = {}) => {
    // Skip if already fetched
    if (fetchedSections[loadingKey]) return;

    // Mark as fetched to prevent duplicate calls
    setFetchedSections((prev) => ({ ...prev, [loadingKey]: true }));
    setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      const startTime = Date.now();
      const { data } = await axios.get(endpoint, {
        timeout: 8000, // 15 second timeout (TMDB can be slow on first fetch)
      });
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      // Log cache status with timing
      const cacheStatus = data.cache_status;
      if (cacheStatus?.is_cached) {
        console.log(
          `🟢 [CACHED] ${endpoint} - Age: ${cacheStatus.cache_age_hours}h (${duration}s)`
        );
      } else {
        console.log(`🔴 [TMDB API] ${endpoint} (${duration}s)`);
      }

      setState(data.results?.slice(0, 10) || []);

      // Set hero movie if this is trending
      if (options.isHero && data.results?.length > 0) {
        setHeroMovie(data.results[0]);
        setLoadingStates((prev) => ({ ...prev, hero: false }));
      }

      // Handle regional data with timing
      if (options.setRegion && data.region) {
        setUserRegion(data.region);
        setLocationTime(duration);
      }

      setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setState([]); // Set empty array on error
      setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Initial load - only hero + top 3 sections
  useEffect(() => {
    /**
     * Smart Lazy Loading Strategy:
     * 1. Load hero/trending immediately (above fold)
     * 2. Load first 3 visible sections
     * 3. Use Intersection Observer to load sections as user scrolls
     * This reduces initial API calls from 15+ to just 4!
     */

    const loadInitialContent = async () => {
      // Load hero first (highest priority)
      await fetchWithState("/api/tmdb/trending/movie/day", setTrendingMoviesByDay, "trendingDay", {
        isHero: true,
      });

      // Load first 2 sections immediately (above the fold)
      await Promise.allSettled([
        fetchWithState("/api/tmdb/trending/movie/week", setTrendingMoviesByWeek, "trendingWeek"),
        fetchWithState("/api/tmdb/movie/now_playing", setNowPlayingMovies, "nowPlaying"),
      ]);
    };

    loadInitialContent();
  }, []);

  // Intersection Observer for lazy loading sections
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "400px", // Start loading 400px before section is visible
      threshold: 0.1,
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute("data-section");

          // Fetch section data based on which section came into view
          switch (sectionName) {
            case "popular":
              fetchWithState("/api/tmdb/movie/popular", setPopularMovies, "popular");
              break;
            case "topRated":
              fetchWithState("/api/tmdb/movie/top_rated", setTopRatedMovies, "topRated");
              break;
            case "upcoming":
              fetchWithState("/api/tmdb/movie/upcoming", setUpcomingMovies, "upcoming");
              break;
            case "regionalMovies":
              fetchWithState("/api/tmdb/region/movies", setRegionalMovies, "regionalMovies", {
                setRegion: true,
              });
              break;
            case "regionalTV":
              fetchWithState("/api/tmdb/region/tv", setRegionalTV, "regionalTV");
              break;
            case "trendingShows":
              fetchWithState("/api/tmdb/trending/tv/day", setTrendingShows, "trendingShows");
              break;
            case "onTheAir":
              fetchWithState("/api/tmdb/tv/on_the_air", setOnTheAirShows, "onTheAir");
              break;
            case "topRatedShows":
              fetchWithState("/api/tmdb/tv/top_rated", setTopRatedShows, "topRatedShows");
              break;
            case "popularShows":
              fetchWithState("/api/tmdb/tv/popular", setLatestShows, "popularShows");
              break;
            default:
              break;
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe all section refs
    const refs = [
      popularRef,
      topRatedRef,
      upcomingRef,
      regionalMoviesRef,
      regionalTVRef,
      trendingShowsRef,
      onTheAirRef,
      topRatedShowsRef,
      popularShowsRef,
    ];

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [fetchedSections]);

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

  // Hero skeleton component
  const HeroSkeleton = () => (
    <div className="relative mb-20">
      <div
        className="relative w-full"
        style={{
          paddingTop: "56.25%",
          minHeight: "500px",
          maxHeight: "70vh",
        }}
      >
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container-modern max-w-5xl mx-auto text-center px-4 space-y-6">
              <div className="h-8 w-32 bg-gray-700 rounded-full mx-auto animate-pulse" />
              <div className="h-16 w-3/4 bg-gray-700 rounded-lg mx-auto animate-pulse" />
              <div className="h-6 w-2/3 bg-gray-700 rounded-lg mx-auto animate-pulse" />
              <div className="flex justify-center gap-3 pt-2">
                <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-10 w-40 bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Hero Section - Show skeleton while loading */}
      {loadingStates.hero ? (
        <HeroSkeleton />
      ) : heroMovie ? (
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
      ) : null}

      {/* Main Content */}
      <div className="py-8 relative">
        <div className="container-modern max-w-[1400px] mx-auto">
          {/* Movie Sections */}
          <div className="space-y-16">
            {/* Regional Section - Lazy loaded on scroll */}
            <div ref={regionalMoviesRef} data-section="regionalMovies">
              {(loadingStates.regionalMovies || (regionalMovies && regionalMovies.length > 0)) && (
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
                        {locationTime && (
                          <span className="ml-2 text-xs text-gray-400">
                            (detected in {locationTime}s)
                          </span>
                        )}
                      </h2>
                    </div>
                    <MovieSection
                      movies={regionalMovies}
                      loading={loadingStates.regionalMovies}
                      hideTitle={true}
                    />
                  </div>
                </div>
              )}
            </div>

            <MovieSection
              title="Trending Movies Today"
              movies={trendingMoviesByDay}
              loading={loadingStates.trendingDay}
            />

            <MovieSection
              title="Trending This Week"
              movies={trendingMoviesByWeek}
              loading={loadingStates.trendingWeek}
            />

            <MovieSection
              title="Now Playing"
              movies={nowPlayingMovies}
              loading={loadingStates.nowPlaying}
            />

            <div ref={popularRef} data-section="popular">
              <MovieSection
                title="Popular Movies"
                movies={popularMovies}
                loading={loadingStates.popular}
              />
            </div>

            <div ref={topRatedRef} data-section="topRated">
              <MovieSection
                title="Top Rated Movies"
                movies={topRatedMovies}
                loading={loadingStates.topRated}
              />
            </div>

            <div ref={upcomingRef} data-section="upcoming">
              <MovieSection
                title="Coming Soon"
                movies={upcomingMovies}
                loading={loadingStates.upcoming}
              />
            </div>

            {/* TV Shows Sections */}
            <div className="pt-16 mt-16 border-t border-gray-800/50">
              <h2 className="text-3xl font-bold gradient-text mb-12">TV Shows</h2>

              <div className="space-y-16">
                {/* Regional TV Shows - Lazy loaded */}
                <div ref={regionalTVRef} data-section="regionalTV">
                  {(loadingStates.regionalTV || (regionalTV && regionalTV.length > 0)) && (
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
                          loading={loadingStates.regionalTV}
                          hideTitle={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div ref={trendingShowsRef} data-section="trendingShows">
                  <MovieSection
                    title="Trending Shows"
                    movies={mapShows(trendingShows)}
                    loading={loadingStates.trendingShows}
                  />
                </div>

                <div ref={onTheAirRef} data-section="onTheAir">
                  <MovieSection
                    title="On The Air"
                    movies={mapShows(onTheAirShows)}
                    loading={loadingStates.onTheAir}
                  />
                </div>

                <div ref={topRatedShowsRef} data-section="topRatedShows">
                  <MovieSection
                    title="Top Rated Shows"
                    movies={mapShows(topRatedShows)}
                    loading={loadingStates.topRatedShows}
                  />
                </div>

                <div ref={popularShowsRef} data-section="popularShows">
                  <MovieSection
                    title="Popular Shows"
                    movies={mapShows(latestShows)}
                    loading={loadingStates.popularShows}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

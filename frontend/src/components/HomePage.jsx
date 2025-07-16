import React, { useEffect, useState } from "react";
import MovieSection from "./MovieSection";
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
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }

        const data = await response.json();
        setMovies(data.results.slice(0, 8));
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
    shows && shows.map(show => ({
      ...show,
      title: show.name,
      release_date: show.first_air_date,
      media_type: "tv"
    }));

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-yellow-400">
          Movie Explorer
        </h1>

        <MovieSection
          title="Trending Movies (Today)"
          movies={trendingMoviesByDay}
          loading={loading}
          error={error}
        />
        <MovieSection
          title="Trending Movies (This Week)"
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
          title="Upcoming Movies"
          movies={upcomingMovies}
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
          title="Latest Shows"
          movies={mapShows(latestShows)}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default HomePage;

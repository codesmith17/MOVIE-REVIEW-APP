import React, { useEffect, useState } from "react";
import MovieSection from "./MovieSection";
const HomePage = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async (url, setMovies) => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZmY0Mjc2MDc2MmUyZWVmZjY1ZTgwNDE5MmVhZDk3MSIsIm5iZiI6MTcyMDAyNjYyNC40OTUzNDEsInN1YiI6IjY1OWQ1OWZjYjZjZmYxMDE0Y2Y3NTdjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7k2PEFKq60uUNx9SvvbJPr6UhNOu8RiKkbWYSbYhCd8",
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
          "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
          setNowPlayingMovies
        ),
        fetchMovies(
          "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
          setPopularMovies
        ),
      ]);
      setLoading(false);
    };

    fetchAllMovies();
  }, []);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-yellow-400">
          Movie Explorer
        </h1>
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
      </div>
    </div>
  );
};

export default HomePage;

import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg";

const MovieCardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse w-full">
    <div className="h-96 bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

const HomePage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/movie/getTrending",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }

        const data = await response.json();
        setTrendingMovies(data.trendMovies);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center text-yellow-400">
          Trending Movies
        </h1>
        <div className="movie-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {loading ? (
            [...Array(8)].map((_, index) => (
              <div key={index} className="w-full max-w-sm">
                <MovieCardSkeleton />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full w-full max-w-md mx-auto">
              <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
                <p className="text-center">Error: {error}</p>
              </div>
            </div>
          ) : trendingMovies?.length > 0 ? (
            trendingMovies.map((movie) => (
              <div
                key={movie.imdbID}
                className="w-full max-w-sm transform hover:scale-105 transition duration-300 ease-in-out"
              >
                <MovieCard
                  id={movie.imdbID}
                  title={movie.name}
                  year={movie.year}
                  type={movie.type}
                  image={movie.poster || defaultImage}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-gray-400 text-xl">No trending movies found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

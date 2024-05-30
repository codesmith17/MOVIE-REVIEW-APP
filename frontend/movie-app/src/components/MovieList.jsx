import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { useLocation } from "react-router-dom";
import Loading from "./Loading";

const MovieList = () => {
  const [movieData, setMovieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  let location = useLocation();

  const loadMoreMovies = () => {
    const searchParams = new URLSearchParams(location.search);
    const searchText = searchParams.get("searchText");
    const currentPage = parseInt(searchParams.get("page") || "1");

    const totalPages = Math.ceil(totalResults / 10);
    if (currentPage >= totalPages) {
      return;
    }

    fetch(
      `https://www.omdbapi.com/?apikey=1f0a0eb9&s=${searchText}&page=${
        currentPage + 1
      }`
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.Search) {
          setMovieData((prevData) => [...prevData, ...response.Search]);
          searchParams.set("page", currentPage + 1);
          window.history.replaceState(null, "", "?" + searchParams.toString());
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetchMovies = () => {
      const searchParams = new URLSearchParams(location.search);
      const searchText = searchParams.get("searchText");

      if (!searchText) {
        setLoading(false);
        return;
      }

      fetch(`https://www.omdbapi.com/?apikey=1f0a0eb9&s=${searchText}&page=1`)
        .then((res) => res.json())
        .then((response) => {
          if (response.Search) {
            setMovieData(response.Search);
            setTotalResults(parseInt(response.totalResults, 10));
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
          setLoading(false);
        });
    };

    fetchMovies();
  }, [location.search]);

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <Loading loading={loading}></Loading>
          ) : movieData.length > 0 ? (
            movieData.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                id={movie.imdbID}
                title={movie.Title}
                year={movie.Year}
                type={movie.Type}
                image={movie.Poster}
              />
            ))
          ) : (
            <p className="text-gray-300 text-center">
              No movies/shows/games found
            </p>
          )}
        </div>
        {movieData.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMoreMovies}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieList;

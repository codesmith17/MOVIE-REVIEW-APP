import React, { useEffect, useState, useCallback, useRef } from "react";
import MovieCard from "./MovieCard";
import { Link, useLocation } from "react-router-dom";
import Loading from "./Loading";

const API_KEY = import.meta.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const MovieList = () => {
  const [movieData, setMovieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();
  const observer = useRef();

  const fetchMovies = useCallback(async (searchText, pageNum) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?query=${searchText}&page=${pageNum}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.results) {
        const filteredResults = data.results.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
        setMovieData((prevData) => [...prevData, ...filteredResults]);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchText = searchParams.get("searchText");

    if (!searchText) {
      setLoading(false);
      return;
    }

    setMovieData([]);
    setPage(1);
    fetchMovies(searchText, 1);
  }, [location.search, fetchMovies]);

  const lastMovieElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (page > 1) {
      const searchParams = new URLSearchParams(location.search);
      const searchText = searchParams.get("searchText");
      fetchMovies(searchText, page);
    }
  }, [page, fetchMovies, location.search]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {loading && <Loading />}
        {!loading && movieData.length === 0 && (
          <p className="text-gray-300 text-center">
            No movies or TV shows found
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movieData.map((item, index) => (
            <Link
              key={item.id}
              to={`/${item.media_type}-page/${item.id}`}
              ref={index === movieData.length - 1 ? lastMovieElementRef : null}
            >
              <MovieCard
                id={item.id}
                title={item.media_type === "movie" ? item.title : item.name}
                year={
                  item.media_type === "movie"
                    ? item.release_date?.substring(0, 4)
                    : item.first_air_date?.substring(0, 4)
                }
                type={item.media_type}
                image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;

import React, { useEffect, useState, useCallback, useRef } from "react";
import MovieCard from "./MovieCard";
import { Link, useLocation } from "react-router-dom";
import Loading from "./Loading";

const MovieList = () => {
  const [movieData, setMovieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  let location = useLocation();
  const observer = useRef();

  const fetchMovies = useCallback((searchText, pageNum) => {
    setLoading(true);
    fetch(
      `https://api.themoviedb.org/3/search/multi?query=${searchText}&page=${pageNum}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
        },
      }
    )
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        if (response.results) {
          const filteredResults = response.results.filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
          setMovieData((prevData) => [...prevData, ...filteredResults]);
          setHasMore(response.page < response.total_pages);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setLoading(false);
      });
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
    <div className="bg-gradient-to-b from-transparent via-gray-900 to-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movieData.map((item, index) => (
            <Link
              key={item.id || index}
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
        {loading && <Loading loading={loading} />}
        {!loading && movieData.length === 0 && (
          <p className="text-gray-300 text-center">
            No movies or TV shows found
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieList;

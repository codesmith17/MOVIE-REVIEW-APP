import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MovieCard } from "../movie"; // Assuming MovieCard component is in the same directory

const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

const ListDetailPage = () => {
  const location = useLocation();
  const list = location.state?.list;
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const apiKey =
        "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI";

      // Fetch details for each movie in list.content
      const promises = list.content.map(async (movie) => {
        const url = `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch movie details");
          }
          const data = await response.json();
          console.log(data);
          return data;
        } catch (error) {
          console.error("Error fetching movie details:", error);
          return null;
        }
      });

      // Wait for all promises to resolve
      const moviesData = await Promise.all(promises);
      console.log(list);
      console.log(moviesData);
      setMovies(moviesData.filter((movie) => movie !== null));
    };

    if (list) {
      fetchMovieDetails();
    }
  }, [list]);

  if (!list) return <p>List not found</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{list.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            year={movie.release_date ? new Date(movie.release_date).getFullYear() : "-"}
            type={movie.media_type || "movie"}
            mediaType={movie.media_type || "movie"}
            image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            rating={movie.vote_average}
          />
        ))}
      </div>
    </div>
  );
};

export default ListDetailPage;

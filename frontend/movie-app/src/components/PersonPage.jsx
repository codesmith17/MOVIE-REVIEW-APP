import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// import { FaStar } from "react-icons/fa";
import MovieCard from "./MovieCard";
// import ActorCard from "./ActorCard";

const PersonPage = () => {
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${id}?append_to_response=combined_credits&language=en-US`,
          {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmU5MzM1Yjg5Y2E3NWE3MGJjY2UxYzcyYmZkMDQ4ZCIsInN1YiI6IjYzYmVkN2FiODU4Njc4MDBmMDhjZjI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQHes_rn51wewxY_7nZLxGssnd67J8ieiLOIo2Bg_FI",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPersonData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching person data:", error);
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id]);

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-8"></div>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
        <div className="w-full max-w-xs md:w-1/4 h-96 bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-6">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
      <div className="mt-16">
        <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
        <div className="flex flex-wrap justify-center gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-32">
              <div className="w-32 h-48 bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!personData) {
    return <div className="text-center text-2xl mt-10">Person not found</div>;
  }

  const {
    name,
    birthday,
    place_of_birth,
    biography,
    profile_path,
    combined_credits,
  } = personData;
  console.log(combined_credits);
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${profile_path})`,
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      ></div>

      <div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-900 to-gray-900 pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-400">
          {name}
        </h1>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
          <img
            src={`https://image.tmdb.org/t/p/w500${profile_path}`}
            alt={name}
            className="w-full max-w-xs md:w-1/4 rounded-lg shadow-lg"
          />
          <div className="flex-1 space-y-6">
            <p className="text-lg">
              <span className="font-semibold text-yellow-400">Birthday:</span>{" "}
              {birthday}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-yellow-400">
                Place of Birth:
              </span>{" "}
              {place_of_birth}
            </p>
            <h2 className="text-2xl font-semibold text-yellow-400">
              Biography
            </h2>
            <p className="text-gray-300">{biography}</p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
            Filmography
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(() => {
              const movies = combined_credits.cast
                .filter((item) => item.media_type === "movie")
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 12);

              const tvShows = combined_credits.cast
                .filter((item) => item.media_type === "tv")
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 12);

              const combined = [...movies, ...tvShows];

              return combined.map((item) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  title={item.title || item.name}
                  year={
                    item.release_date
                      ? item.release_date.split("-")[0]
                      : item.first_air_date
                      ? item.first_air_date.split("-")[0]
                      : "N/A"
                  }
                  type={item.media_type}
                  image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  rating={item.vote_average}
                />
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonPage;

import React, { useEffect, useState } from "react";

import MovieCard from "./MovieCard"; // Assuming MovieCard component is in a separate file
import Loading from "./Loading";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg"; // Update this with the path to your default image

const HomePage = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await fetch(
          "https://moviesdatabase.p.rapidapi.com/titles/x/upcoming?year=2024",
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key":
                "fa195bed30msh7e9f476e5e85035p1afb19jsn190f3c1e8075",
              "X-RapidAPI-Host": "moviesdatabase.p.rapidapi.com",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUpcomingMovies(data.results);
        if (user) setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8 text-center text-white">
          Upcoming Movies
        </h1>
        {loading ? (
          <Loading loading={loading}></Loading>
        ) : (
          <div className="movie-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center p-6">
            {upcomingMovies.length > 0 ? (
              upcomingMovies.map((movie) => (
                <div key={movie.id}>
                  <MovieCard
                    id={movie.id}
                    title={movie.titleText.text}
                    year={movie.releaseDate.year}
                    type={movie.titleType.text}
                    image={movie.primaryImage?.url || defaultImage}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center w-full">
                No upcoming movies found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

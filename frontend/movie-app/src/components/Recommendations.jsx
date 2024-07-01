import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Recommendations = ({ imdbID }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = () => {
      fetch(`http://localhost:3000/api/movie/getRecommendations/${imdbID}`)
        .then((res) => res.json())
        .then((data) => setRecommendations(data.recommendations))
        .catch((err) => console.error("Error fetching recommendations:", err));
    };

    fetchRecommendations();
  }, [imdbID]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
      {recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Link
              to={`/movie-page/${rec.imdbID}`}
              key={rec.imdbID}
              className="block p-4 rounded-lg shadow-md text-black bg-white hover:text-gray-100 hover:bg-gray-800 transition duration-300"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={rec.Poster}
                  alt={rec.Title}
                  className="w-20 rounded-lg shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold">{rec.Title}</h3>
                  <p>{rec.Genre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
};

export default Recommendations;

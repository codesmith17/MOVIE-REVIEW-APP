import React from "react";
import { Link } from "react-router-dom";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg"; // Update this with the path to your default image

const MovieCard = ({ id, title, year, type, image }) => {
  console.log(image);
  return (
    <Link to={`/movie-page/${id}`}>
      <div className="bg-gray-800 cursor-pointer border border-gray-700 rounded-lg shadow-lg overflow-hidden w-full sm:w-56 md:w-64 text-center transform transition-transform duration-300 hover:scale-105">
        <img
          src={image || defaultImage}
          alt={title}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
        />
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-100">{title}</h2>
          <p className="text-gray-400">Year of release: {year}</p>
          <p className="text-gray-400">Type: {type}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

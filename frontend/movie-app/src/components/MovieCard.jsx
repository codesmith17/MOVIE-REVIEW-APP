import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg";

const MovieCard = ({ id, title, year, type, image, rating }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setIsLoading(false);
        setImageError(true);
      };
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [image]);

  const ratingColor =
    rating >= 7
      ? "text-green-500"
      : rating >= 5
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <Link to={`/movie-page/${id}`} className="group">
      <div className="bg-gray-800 cursor-pointer rounded-lg shadow-lg overflow-hidden w-full sm:w-56 md:w-64 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className="relative">
          {isLoading ? (
            <div className="w-full h-48 sm:h-72 md:h-80 bg-gray-700 animate-pulse"></div>
          ) : (
            <>
              <img
                src={
                  imageError ||
                  image === "https://cdn.watchmode.com/posters/blank.gif"
                    ? defaultImage
                    : image
                }
                alt={title}
                className="w-full h-48 sm:h-72 md:h-80 object-cover transition-opacity duration-300 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <span className="text-white text-lg font-bold">
                  View Details
                </span>
              </div>
            </>
          )}
          {rating && !isLoading && (
            <div
              className={`absolute top-2 right-2 bg-gray-900 bg-opacity-75 rounded-full p-2 ${ratingColor}`}
            >
              <FaStar className="inline mr-1" />
              <span className="font-bold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {isLoading ? (
            <>
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2 text-gray-100 group-hover:text-white transition-colors duration-300 line-clamp-2">
                {title}
              </h2>
              <p className="text-gray-400 mb-1 text-sm">{year}</p>
              <p className="text-gray-400 text-sm capitalize">{type}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

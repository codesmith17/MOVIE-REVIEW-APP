import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg";

const MovieCard = ({ id, title, year, type, image, key }) => {
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

  return (
    <Link
      to={`/movie-page/${id}`}
      onClick={() => {
        window.location.reload();
      }}
    >
      <div className="bg-gray-800 cursor-pointer border border-gray-700 rounded-lg shadow-lg overflow-hidden w-full sm:w-56 md:w-64 text-center transform transition-transform duration-300 hover:scale-105">
        {isLoading ? (
          <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-700 animate-pulse"></div>
        ) : (
          <img
            src={
              imageError ||
              image === "https://cdn.watchmode.com/posters/blank.gif"
                ? defaultImage
                : image
            }
            alt={title}
            className="w-full h-48 sm:h-56 md:h-64 object-cover"
          />
        )}
        <div className="p-4">
          {isLoading ? (
            <>
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2 text-gray-100">
                {title}
              </h2>
              <p className="text-gray-400">Year: {year}</p>
              <p className="text-gray-400">Type: {type}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

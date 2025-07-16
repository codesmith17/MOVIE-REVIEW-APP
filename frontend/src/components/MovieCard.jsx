import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";

const renderFallbackImage = (title, mediaType) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center text-gray-400">
    <div className="text-6xl mb-4">🎬</div>
    <div className="text-sm text-center px-4 font-medium">
      {mediaType === "movie" ? "Movie" : "TV Show"}
    </div>
    <div className="text-xs text-center px-4 mt-2 line-clamp-2">
      {title?.slice(0, 30)}...
    </div>
  </div>
);

const MovieCard = ({ id, title, year, type, image, rating, mediaType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const ratingColor =
    rating >= 7
      ? "text-green-400"
      : rating >= 5
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <Link to={`/${mediaType || type}/${id}`} className="group block">
      <div className="bg-gray-900 cursor-pointer rounded-2xl shadow-lg overflow-hidden w-full max-w-[200px] h-[340px] mx-auto text-center flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        <div className="relative w-full h-[280px] flex-shrink-0">
          {isLoading ? (
            <div className="w-full h-full bg-gray-800 animate-pulse"></div>
          ) : imageError ||
            image === "https://cdn.watchmode.com/posters/blank.gif" ||
            !image ? (
            renderFallbackImage(title, mediaType || type)
          ) : (
            <>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                  <IoMdOpen className="text-white text-2xl" />
                </div>
              </div>
            </>
          )}
          {rating && !isLoading && (
            <div
              className={`absolute top-2 left-2 flex items-center bg-black bg-opacity-70 rounded-full px-2 py-1 ${ratingColor}`}
            >
              <FaStar className="mr-1" />
              <span className="font-bold text-sm">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-end p-3">
          <h3 className="text-base font-bold text-white mb-1 truncate">{title}</h3>
          <p className="text-gray-300 text-xs mb-1">{year}</p>
          <span className="inline-block bg-gray-800/80 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
            {mediaType?.charAt(0).toUpperCase() + mediaType?.slice(1) || type?.charAt(0).toUpperCase() + type?.slice(1)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

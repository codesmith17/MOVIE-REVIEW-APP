import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";

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
      ? "text-green-400"
      : rating >= 5
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <Link to={`/movie-page/${id}${type}`} className="group block">
      <div className="bg-gray-900 cursor-pointer rounded-xl shadow-lg overflow-hidden w-full max-w-[220px] mx-auto text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        <div className="relative w-full h-[330px]">
          {isLoading ? (
            <div className="w-full h-full bg-gray-800 animate-pulse"></div>
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
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
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
        <div className="p-4">
          {isLoading ? (
            <>
              <div className="h-5 bg-gray-800 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-1 text-gray-100 group-hover:text-white transition-colors duration-300 line-clamp-2">
                {title}
              </h2>
              <p className="text-gray-400 mb-1 text-xs">{year}</p>
              <p className="text-gray-400 text-xs capitalize bg-gray-800 inline-block px-2 py-1 rounded-full">
                {type}
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

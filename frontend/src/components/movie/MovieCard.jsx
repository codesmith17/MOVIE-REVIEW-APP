import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { LazyImage } from "../common";

const MovieCard = ({ id, title, year, type, image, rating, mediaType, priority = false }) => {
  // Determine rating color and badge
  const getRatingBadge = (rating) => {
    if (!rating) return null;
    
    const ratingValue = typeof rating === 'number' ? rating : parseFloat(rating);
    let colorClass, bgClass;
    
    if (ratingValue >= 8) {
      colorClass = "text-emerald-400";
      bgClass = "bg-emerald-500/20 border-emerald-500/30";
    } else if (ratingValue >= 7) {
      colorClass = "text-green-400";
      bgClass = "bg-green-500/20 border-green-500/30";
    } else if (ratingValue >= 5) {
      colorClass = "text-amber-400";
      bgClass = "bg-amber-500/20 border-amber-500/30";
    } else {
      colorClass = "text-red-400";
      bgClass = "bg-red-500/20 border-red-500/30";
    }
    
    return { colorClass, bgClass, value: ratingValue.toFixed(1) };
  };

  const ratingBadge = getRatingBadge(rating);
  const displayMediaType = mediaType || type;
  const mediaTypeLabel = displayMediaType === 'movie' ? 'Movie' : displayMediaType === 'tv' ? 'TV Show' : displayMediaType;

  return (
    <Link to={`/${displayMediaType}/${id}`} className="group block">
      <div className="relative overflow-hidden w-full max-w-[200px] mx-auto min-h-[360px] flex flex-col rounded-xl bg-gray-900/40 backdrop-blur-sm transition-all duration-300 group-hover:bg-gray-800/60 group-hover:scale-[1.02] group-hover:shadow-2xl">
        {/* Image Container */}
        <div className="relative w-full h-[270px] flex-shrink-0 overflow-hidden rounded-t-xl">
          <LazyImage
            src={image}
            alt={title}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            objectFit="cover"
            priority={priority}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          {ratingBadge && (
            <div className={`absolute top-3 right-3 flex items-center gap-1 ${ratingBadge.bgClass} backdrop-blur-md rounded-lg px-2.5 py-1.5 border ${ratingBadge.colorClass} font-bold text-sm shadow-lg`}>
              <FaStar className="text-xs" />
              <span>{ratingBadge.value}</span>
            </div>
          )}
          
          {/* Media Type Badge */}
          <div className="absolute top-3 left-3 badge badge-secondary text-xs px-2 py-1 backdrop-blur-md">
            {mediaTypeLabel}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-start p-4 bg-gradient-to-b from-gray-800/50 to-gray-900/80 rounded-b-xl min-h-[90px]">
          <div>
            <h3 className="text-sm font-bold text-gray-50 mb-2 line-clamp-3 leading-snug group-hover:text-white transition-colors duration-200">
              {title}
            </h3>
            {year && (
              <p className="text-xs text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-200">{year}</p>
            )}
          </div>
        </div>
        
        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-300 pointer-events-none" />
      </div>
    </Link>
  );
};

export default MovieCard;

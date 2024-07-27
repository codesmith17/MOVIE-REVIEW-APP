import React, { useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const StarRating = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRating = (value) => {
    setRating(value);
    onRatingChange(value);
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        const isHalfStar =
          hover - ratingValue === -0.5 || rating - ratingValue === -0.5;
        const isFullStar = (hover || rating) >= ratingValue;

        return (
          <div key={index} className="relative">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={ratingValue - 0.5}
                onClick={() => handleRating(ratingValue - 0.5)}
                className="hidden"
              />
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => handleRating(ratingValue)}
                className="hidden"
              />
              <span
                className={`text-4xl transition-all duration-200 ${
                  isFullStar
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(255,204,0,1)]"
                    : isHalfStar
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(255,204,0,1)]"
                    : "text-gray-300"
                }`}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              >
                {isHalfStar ? <FaStarHalfAlt /> : <FaStar />}
              </span>
            </label>
            <span
              className="absolute inset-0 w-1/2 cursor-pointer"
              onMouseEnter={() => setHover(ratingValue - 0.5)}
              onClick={() => handleRating(ratingValue - 0.5)}
            ></span>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;

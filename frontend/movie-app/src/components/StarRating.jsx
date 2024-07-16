import React, { useState } from "react";

const StarRating = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRating = (value) => {
    setRating(value);
    onRatingChange(value);
  };

  return (
    <div className="flex">
      {[...Array(10)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => handleRating(ratingValue)}
              className="hidden"
            />
            <span
              className={`text-4xl transition-all duration-200 ${
                (hover || rating) >= ratingValue
                  ? "text-yellow-400 hover:text-yellow-400 hover:drop-shadow-[0_0_20px_rgba(255,204,0,1)]"
                  : "text-gray-300 hover:text-yellow-400 hover:drop-shadow-[0_0_20px_rgba(255,204,0,1)]"
              }`}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;

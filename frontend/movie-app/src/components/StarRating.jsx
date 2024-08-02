import React, { useState } from "react";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa6";
const StarRating = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);

  const handleRating = (value) => {
    setRating(value);
    onRatingChange(value); // Call the provided onRatingChange function with the new rating
  };

  return (
    <ReactStars
      count={5}
      onChange={handleRating}
      size={49}
      isHalf={true}
      value={rating}
      emptyIcon={<FaStar />}
      halfIcon={<FaStarHalf />}
      fullIcon={<FaStar />}
      activeColor="#ffd700"
    />
  );
};

export default StarRating;

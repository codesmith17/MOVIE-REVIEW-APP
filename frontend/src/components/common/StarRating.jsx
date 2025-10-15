import { useState, useEffect } from "react";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa6";

const StarRating = ({ value, onRatingChange }) => {
  const [rating, setRating] = useState(value);

  useEffect(() => {
    setRating(value);
  }, [value]);

  const handleRating = (val) => {
    setRating(val);
    onRatingChange(val);
  };

  return (
    <ReactStars
      key={rating}
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

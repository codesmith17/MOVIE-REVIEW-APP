import React from "react";
import { FaStar } from "react-icons/fa";

const ReadOnlyStarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let color;
    if (i <= rating) {
      color = "#ffc107";
    } else {
      color = "#e3e5e9";
    }
    stars.push(<FaStar key={i} style={{ color: color, fontSize: "1.5rem" }} />);
  }
  return <div className="flex items-center space-x-1">{stars}</div>;
};

export default ReadOnlyStarRating;

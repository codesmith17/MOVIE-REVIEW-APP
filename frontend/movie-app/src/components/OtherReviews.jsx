import React from "react";
import { Link } from "react-router-dom";

const OtherReviews = ({ reviews }) => {
  console.log(reviews);
  return (
    <div>
      {reviews && reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review._id}
            className="border p-4 rounded-lg shadow-md bg-gray-100 mb-4"
          >
            <p>
              <strong>Review By:</strong>
              {" " + review.email}
            </p>
            <p>
              <strong>Rating:</strong> {review.rating}
            </p>
            <p>
              <strong>Date:</strong> {review.dateLogged}
            </p>
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{
                __html: `${review.review.substring(0, 200)}...`,
              }}
            />
            <Link
              to={`/movie-page/${review.imdbID}/${review._id.toString()}`}
              className="inline-block bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Read More
            </Link>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default OtherReviews;

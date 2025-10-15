import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaStar } from "react-icons/fa";

const WriteReviewModal = ({
  dateLogged,
  handleDateChange,
  review,
  setReview,
  starRatingTemp,
  setStarRatingTemp,
  handleReviewSubmit,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-bold mb-2">Date Logged</label>
        <DatePicker
          selected={dateLogged}
          onChange={handleDateChange}
          dateFormat="dd-MM-yyyy"
          className="p-2 border border-gray-300 rounded-lg w-full"
          maxDate={new Date()}
          todayButton="Today"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-bold mb-2">Your Review</label>
        <ReactQuill
          value={review}
          onChange={setReview}
          theme="snow"
          className="bg-gray-100 p-2 rounded-lg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <p className="font-bold">Your Rating:</p>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((star, index) => {
            const ratingValue = index + 1;
            return (
              <FaStar
                key={index}
                className="cursor-pointer"
                color={ratingValue <= starRatingTemp ? "#ffc107" : "#e4e5e9"}
                size={25}
                onClick={() => setStarRatingTemp(ratingValue)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleReviewSubmit}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default WriteReviewModal;

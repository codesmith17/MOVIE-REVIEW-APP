import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaExpand, FaCompress, FaTimes } from "react-icons/fa";
import { StarRating } from "../common";

const WriteReviewModal = ({
  isOpen,
  onClose,
  singleMovieData,
  starRatingTemp,
  setStarRatingTemp,
  dateLogged,
  setDateLogged,
  review,
  setReview,
  isEditorExpanded,
  setIsEditorExpanded,
  handleReviewSubmit,
}) => {
  if (!isOpen) return null;

  const handleDateChange = (date) => {
    setDateLogged(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content - Full Screen */}
      <div className="relative z-50 w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-yellow-400 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Write Your Review</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              title="Close"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-[calc(95vh-88px)]">
            <div className="p-8">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - Movie Poster and Info */}
                <div className="lg:col-span-1 flex flex-col items-center lg:items-start space-y-6">
                  <div className="relative group">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${singleMovieData?.poster_path}`}
                      alt={singleMovieData.title || singleMovieData.name}
                      className="w-full max-w-[280px] rounded-xl object-cover shadow-2xl border-4 border-gray-700 group-hover:border-blue-500 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="text-center lg:text-left space-y-2 w-full">
                    <h3 className="font-bold text-white text-2xl leading-tight">
                      {singleMovieData?.title || singleMovieData?.name}
                    </h3>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-400">
                      <span className="text-lg">
                        {(singleMovieData?.release_date || singleMovieData?.first_air_date || "").slice(0, 4)}
                      </span>
                      {singleMovieData?.vote_average && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-yellow-400 font-semibold">
                            ⭐ {singleMovieData.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    {singleMovieData?.genres && singleMovieData.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-3">
                        {singleMovieData.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Rating */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all">
                    <label className="block text-white font-bold mb-4 text-lg flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      Your Rating
                    </label>
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="bg-gray-900/50 px-6 py-4 rounded-xl">
                        <StarRating
                          value={starRatingTemp}
                          onRatingChange={(val) => setStarRatingTemp(val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
                    <label className="block text-white font-bold mb-4 text-lg flex items-center gap-2">
                      <span className="text-2xl">📅</span>
                      Date Watched
                    </label>
                    <DatePicker
                      selected={dateLogged}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-lg transition-all placeholder-gray-500"
                      maxDate={new Date()}
                      placeholderText="Select date"
                    />
                  </div>

                  {/* Review */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Your Review
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-blue-600 rounded-lg transition-all font-medium"
                        title={isEditorExpanded ? "Minimize editor" : "Maximize editor"}
                      >
                        {isEditorExpanded ? (
                          <>
                            <FaCompress className="text-xs" />
                            <span>Minimize</span>
                          </>
                        ) : (
                          <>
                            <FaExpand className="text-xs" />
                            <span>Maximize</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="border-2 border-gray-700 rounded-xl overflow-hidden focus-within:border-green-500 transition-all bg-white">
                      <ReactQuill
                        value={review}
                        onChange={setReview}
                        theme="snow"
                        placeholder="Share your thoughts, feelings, and insights about this movie. What did you love? What surprised you? Would you recommend it?"
                        modules={{
                          toolbar: [
                            ["bold", "italic", "underline"],
                            [{ list: "ordered" }, { list: "bullet" }],
                          ],
                        }}
                        style={{
                          height: isEditorExpanded ? "500px" : "250px",
                          backgroundColor: "white",
                          transition: "height 0.3s ease",
                        }}
                        formats={["bold", "italic", "underline", "list", "bullet"]}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <button
                      className="px-8 py-4 text-white font-bold border-2 border-gray-600 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all text-lg"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600 text-lg shadow-lg hover:shadow-2xl hover:scale-105 transform"
                      onClick={handleReviewSubmit}
                      disabled={!dateLogged || !review.trim() || starRatingTemp === 0}
                    >
                      Submit Review ✨
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;


import { useState } from "react";
import { motion } from "framer-motion";
import { ImSpinner10 } from "react-icons/im";

const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  searchResults,
  handleSearchMovie,
  loading,
  onSelectMovie,
  isCreatingList,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isOpen ? 1 : 0 }}
    exit={{ opacity: 0 }}
    className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 ${
      isOpen ? "" : "hidden"
    }`}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-white text-center">
        {isCreatingList ? "Select Movie for New List" : "Search Movies"}
      </h2>
      <div className="flex mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearchMovie()}
          className="flex-grow p-3 rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search for a movie..."
        />
        <button
          onClick={handleSearchMovie}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300 ease-in-out"
          disabled={loading}
        >
          {loading ? <ImSpinner10 className="animate-spin" /> : "Search"}
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ImSpinner10 className="text-white text-4xl animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((movie) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center mb-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out"
            >
              <img
                src={`https://image.tmdb.org/t/p/w92${movie?.poster_path}`}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-md mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/92x138?text=No+Image";
                }}
              />
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-white mb-1">{movie.title}</h3>
                <p className="text-gray-400 text-sm">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              </div>
              <button
                onClick={() => onSelectMovie(movie)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
              >
                {isCreatingList ? "Select" : "Add to list"}
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No results found. Try a different search.</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out w-full"
      >
        {isCreatingList ? "Cancel" : "Close"}
      </button>
    </motion.div>
  </motion.div>
);

export default SearchModal;

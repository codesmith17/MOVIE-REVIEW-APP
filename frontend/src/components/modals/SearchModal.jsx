import { motion, AnimatePresence } from "framer-motion";
import { ImSpinner10 } from "react-icons/im";
import { FaTimes, FaSearch, FaFilm, FaTv, FaStar } from "react-icons/fa";

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
  listName,
  hasMoreResults,
  loadMoreResults,
}) => {
  const formatYear = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return "N/A";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-700/50 relative overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl -z-10" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-full z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <FaSearch className="text-2xl text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {isCreatingList ? `Add Movies to "${listName}"` : "Search Movies & Shows"}
              </h2>
              <p className="text-gray-400">
                {isCreatingList
                  ? "Search and select movies to add to your list"
                  : "Find your favorite movies and TV shows"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 pl-12 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg"
                  placeholder="Search for movies or TV shows... (auto-search)"
                  autoFocus
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                {loading && (
                  <ImSpinner10 className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 text-xl animate-spin" />
                )}
              </div>
              {searchQuery && searchQuery.trim().length > 0 && (
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  Searching automatically as you type...
                </p>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((movie, index) => (
                    <motion.div
                      key={`${movie.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="group flex items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/30 hover:border-cyan-500/50"
                    >
                      {/* Poster */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            movie?.poster_path
                              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                              : "/assets/no-image.svg"
                          }
                          alt={movie.title || movie.name}
                          className="w-16 h-24 object-cover rounded-lg shadow-lg group-hover:shadow-cyan-500/30 transition-shadow bg-gray-800/50"
                          onError={(e) => {
                            // Prevent infinite loop
                            if (e.target.src !== `${window.location.origin}/assets/no-image.svg`) {
                              e.target.onerror = null;
                              e.target.src = "/assets/no-image.svg";
                            }
                          }}
                        />
                        {movie.media_type && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-1.5 shadow-lg">
                            {movie.media_type === "tv" ? (
                              <FaTv className="text-white text-xs" />
                            ) : (
                              <FaFilm className="text-white text-xs" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {movie.title || movie.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{formatYear(movie.release_date || movie.first_air_date)}</span>
                          {movie.vote_average > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-500 text-xs" />
                                <span>{movie.vote_average.toFixed(1)}</span>
                              </div>
                            </>
                          )}
                          {movie.media_type && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400 capitalize">{movie.media_type}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Select Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectMovie(movie)}
                        className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg"
                      >
                        {isCreatingList ? "Add" : "Select"}
                      </motion.button>
                    </motion.div>
                  ))}

                  {/* Load More Button */}
                  {hasMoreResults && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadMoreResults}
                      disabled={loading}
                      className="w-full mt-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <ImSpinner10 className="animate-spin text-xl" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <FaSearch />
                          <span>Load More Results</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              ) : searchQuery ? (
                loading ? (
                  <div className="flex flex-col justify-center items-center h-full py-20">
                    <ImSpinner10 className="text-cyan-500 text-5xl animate-spin mb-4" />
                    <p className="text-gray-400 text-lg">Searching...</p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full py-20">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-400 text-lg text-center">
                      No results found for "{searchQuery}"
                      <br />
                      <span className="text-sm">Try a different search term</span>
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col justify-center items-center h-full py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400 text-lg">Start searching for movies and TV shows</p>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 w-full shadow-lg"
            >
              {isCreatingList ? "Cancel" : "Close"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;

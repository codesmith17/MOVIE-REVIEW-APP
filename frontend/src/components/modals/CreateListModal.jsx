import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaList, FaPlus, FaSearch } from "react-icons/fa";
import { ImSpinner10 } from "react-icons/im";

const CreateListModal = ({ isOpen, onClose, onCreateList, onSelectMovieClick, loading }) => {
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (listName.trim()) {
      onCreateList(listName.trim(), listDescription.trim());
      setListName("");
      setListDescription("");
    }
  };

  const handleClose = () => {
    setListName("");
    setListDescription("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-700/50 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full blur-3xl -z-10" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-full"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <FaList className="text-3xl text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Create New List
              </h2>
              <p className="text-gray-400 text-lg">Organize your favorite movies and shows</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* List Name Input */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wider">
                  List Name *
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., My Favorite Sci-Fi Movies"
                  className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg"
                  required
                  maxLength={100}
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2">{listName.length}/100 characters</p>
              </div>

              {/* List Description Input */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Add a description to help others understand what this list is about..."
                  className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg resize-none"
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2">
                  {listDescription.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!listName.trim() || loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <ImSpinner10 className="animate-spin text-xl" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Create Empty List
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (listName.trim()) {
                      onSelectMovieClick(listName.trim(), listDescription.trim());
                      setListName("");
                      setListDescription("");
                    }
                  }}
                  disabled={!listName.trim() || loading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  <FaSearch />
                  Add Movies
                </motion.button>
              </div>

              {/* Info text */}
              <p className="text-gray-400 text-sm text-center">
                You can add movies now or create an empty list and add them later
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateListModal;

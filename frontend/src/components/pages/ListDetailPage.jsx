import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaList,
  FaEye,
  FaFilm,
  FaTrash,
  FaArrowLeft,
  FaGripVertical,
  FaPlus,
} from "react-icons/fa";
import { MovieLoader } from "../common";
import { ConfirmModal, SearchModal } from "../modals";
import { MovieCard } from "../movie";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

const ListDetailPage = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: null, itemId: null });

  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isAddingMovie, setIsAddingMovie] = useState(false);

  // Refs for debouncing and cancellation
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch list details
  useEffect(() => {
    const fetchListDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/list/getListById/${listId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch list");
        }

        const data = await response.json();
        setList(data.data);

        // Enrich movie data with TMDB details if missing
        const enrichedContent = await Promise.all(
          (data.data.content || []).map(async (movie) => {
            // If movie has all required fields, return as is
            if (movie.posterLink && movie.title && movie.mediaType) {
              return movie;
            }

            // Otherwise, fetch from TMDB
            try {
              const tmdbResponse = await fetch(`${API_BASE_URL}/api/tmdb/movie/${movie.id}`, {
                credentials: "include",
              });

              if (tmdbResponse.ok) {
                const tmdbData = await tmdbResponse.json();
                return {
                  id: movie.id,
                  posterLink: tmdbData.poster_path
                    ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                    : null,
                  title: tmdbData.title || tmdbData.name || "Untitled",
                  imdbID: tmdbData.imdb_id || movie.imdbID || `movie-${movie.id}`,
                  mediaType: "movie",
                };
              }
            } catch (err) {
              console.error(`Error fetching movie ${movie.id}:`, err);
            }

            // Return original if fetch fails
            return {
              id: movie.id,
              posterLink: movie.posterLink || null,
              title: movie.title || "Untitled",
              imdbID: movie.imdbID || `movie-${movie.id}`,
              mediaType: movie.mediaType || "movie",
            };
          })
        );

        setListItems(enrichedContent);
      } catch (error) {
        console.error("Error fetching list:", error);
        toast.error("Failed to load list");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    if (listId) {
      fetchListDetails();
    }
  }, [listId, navigate]);

  // Handle remove movie from list
  const handleRemoveMovie = async () => {
    const movieId = confirmDelete.itemId;
    setDeletingItemId(movieId);
    setConfirmDelete({ isOpen: false, type: null, itemId: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/list/removeFromList/${listId}/${movieId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setListItems(listItems.filter((item) => item.id !== movieId));
        toast.success("Movie removed from list!");
      } else {
        throw new Error("Failed to remove movie");
      }
    } catch (error) {
      console.error("Error removing movie:", error);
      toast.error("Failed to remove movie");
    } finally {
      setDeletingItemId(null);
    }
  };

  // Handle delete entire list
  const handleDeleteList = async () => {
    setConfirmDelete({ isOpen: false, type: null, itemId: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/list/deleteList/${listId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("List deleted successfully!");
        navigate(-1);
      } else {
        throw new Error("Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  // Debounced search function
  const handleSearchMovie = useCallback(
    async (query = searchQuery, page = 1) => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!query || query.trim().length === 0) {
        setSearchResults([]);
        setHasMoreResults(false);
        return;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setSearchLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/tmdb/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
          { signal: abortControllerRef.current.signal, credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to search movies and shows");
        const data = await response.json();

        // Filter to only movies and TV shows
        const filteredResults = data.results.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );

        if (page === 1) {
          setSearchResults(filteredResults);
        } else {
          setSearchResults((prev) => [...prev, ...filteredResults]);
        }

        setSearchPage(page);
        setHasMoreResults(data.page < data.total_pages);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Search request cancelled");
          return;
        }
        console.error("Error searching movies and shows:", error);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery]
  );

  // Auto-search with debounce when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchMovie(searchQuery, 1);
      }, 500);
    } else {
      setSearchResults([]);
      setHasMoreResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearchMovie]);

  // Load more results
  const loadMoreResults = () => {
    if (!searchLoading && hasMoreResults) {
      handleSearchMovie(searchQuery, searchPage + 1);
    }
  };

  // Add movie to list
  const handleAddMovie = async (movie) => {
    setIsAddingMovie(true);
    try {
      const movieData = {
        id: movie.id,
        title: movie.title || movie.name,
        posterLink: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        imdbID: movie.imdb_id || `${movie.media_type}-${movie.id}`,
        mediaType: movie.media_type || "movie",
        listName: list.name,
      };

      const response = await fetch(`${API_BASE_URL}/api/list/addToList/normal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: movieData }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`${movieData.title} added to list! 🎬`);
        setIsSearchModalOpen(false);
        setSearchQuery("");
        setSearchResults([]);

        // Add to local state
        setListItems([...listItems, movieData]);
      } else {
        const error = await response.json();
        if (error.message === "Movie already in the list") {
          toast.info("This movie is already in the list");
        } else {
          throw new Error("Failed to add movie");
        }
      }
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie to list");
    } finally {
      setIsAddingMovie(false);
    }
  };

  if (isLoading) {
    return <MovieLoader fullScreen />;
  }

  if (!list) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-gray-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <FaList className="text-3xl text-cyan-400" />
                <h1 className="text-4xl font-bold text-white">{list.name}</h1>
              </div>
              {list.description && (
                <p className="text-gray-400 text-lg mb-4 max-w-3xl">{list.description}</p>
              )}
              <div className="flex items-center gap-6 text-sm">
                <span className="text-cyan-400 font-medium text-lg">
                  {listItems.length} {listItems.length === 1 ? "movie" : "movies"}
                </span>
                {list.isPublic && (
                  <span className="flex items-center gap-2 text-green-400">
                    <FaEye />
                    Public
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Add Movie Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl transition-all text-white font-medium shadow-lg"
              >
                <FaPlus />
                Add Movie
              </motion.button>

              {/* Delete List Button */}
              {list.type !== "watchlist" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDelete({ isOpen: true, type: "list", itemId: null })}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-colors border border-red-500/30 text-red-400 font-medium"
                >
                  <FaTrash />
                  Delete List
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {listItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {listItems.map((movie, index) => (
              <motion.div
                key={movie.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="relative group"
              >
                {/* Movie Card */}
                <MovieCard
                  id={movie.id}
                  title={movie.title || "Untitled"}
                  image={movie.posterLink || "/assets/no-image.svg"}
                  mediaType={movie.mediaType || "movie"}
                  priority={index < 6}
                />

                {/* Remove Button Overlay */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDelete({ isOpen: true, type: "movie", itemId: movie.id });
                  }}
                  disabled={deletingItemId === movie.id}
                  className="absolute top-2 right-2 p-2.5 bg-red-600/90 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50 z-30 shadow-lg"
                  title="Remove from list"
                >
                  {deletingItemId === movie.id ? (
                    <div className="w-4 h-4">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    <FaTrash className="text-white text-sm" />
                  )}
                </motion.button>

                {/* Drag Handle (for future drag-and-drop) */}
                <div className="absolute top-2 left-2 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <FaGripVertical className="text-gray-400 text-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaFilm className="text-gray-600 text-8xl mb-6 mx-auto" />
            <h3 className="text-3xl font-bold text-gray-400 mb-3">Empty List</h3>
            <p className="text-gray-500 text-lg">Add movies to this list to get started!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, type: null, itemId: null })}
        onConfirm={confirmDelete.type === "list" ? handleDeleteList : handleRemoveMovie}
        title={confirmDelete.type === "list" ? "Delete List?" : "Remove Movie?"}
        message={
          confirmDelete.type === "list"
            ? `Are you sure you want to delete "${list.name}"? This action cannot be undone.`
            : "Are you sure you want to remove this movie from the list?"
        }
        confirmText={confirmDelete.type === "list" ? "Delete List" : "Remove Movie"}
        confirmColor="red"
      />

      {/* Search Modal for adding movies */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        loading={searchLoading || isAddingMovie}
        onSelectMovie={handleAddMovie}
        isCreatingList={false}
        listName={list.name}
        hasMoreResults={hasMoreResults}
        loadMoreResults={loadMoreResults}
      />
    </div>
  );
};

export default ListDetailPage;

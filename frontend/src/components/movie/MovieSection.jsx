import { useState, useRef, useEffect } from "react";
import MovieCard from "./MovieCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const defaultImage = "https://www.reelviews.net/resources/img/default_poster.jpg";

const MovieCardSkeleton = () => (
  <div className="skeleton w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] mx-auto h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-xl"></div>
);

const MovieSection = ({ title, movies, loading, error, hideTitle = false }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide arrows
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [movies, loading]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const isMobile = window.innerWidth < 640;
      const scrollAmount = isMobile ? 200 : 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="fade-in">
      {/* Section Header */}
      {!hideTitle && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold gradient-text">{title}</h2>

          {/* Desktop Scroll Buttons */}
          {!loading && movies?.length > 4 && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`glass p-2 rounded-lg transition-all ${
                  canScrollLeft
                    ? "hover:bg-white/20 text-white"
                    : "opacity-30 cursor-not-allowed text-gray-500"
                }`}
              >
                <FaChevronLeft className="text-lg" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`glass p-2 rounded-lg transition-all ${
                  canScrollRight
                    ? "hover:bg-white/20 text-white"
                    : "opacity-30 cursor-not-allowed text-gray-500"
                }`}
              >
                <FaChevronRight className="text-lg" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Movies Container */}
      <div className="relative">
        {/* Gradient Fade Effects */}
        {!loading && movies?.length > 4 && canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0e27] to-transparent z-10 pointer-events-none" />
        )}
        {!loading && movies?.length > 4 && canScrollRight && (
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0e27] to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto custom-scrollbar pb-4 scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {loading ? (
            // Loading Skeletons
            [...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <MovieCardSkeleton />
              </div>
            ))
          ) : error ? (
            // Error State
            <div className="w-full flex items-center justify-center py-12">
              <div className="card-modern p-6 max-w-md text-center">
                <div className="text-red-400 text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold text-white mb-2">Error Loading Content</h3>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          ) : movies?.length > 0 ? (
            // Movie Cards
            movies.map((movie, index) => (
              <div key={movie.id} className="flex-shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                  type={movie.media_type || "movie"}
                  mediaType={movie.media_type || "movie"}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : defaultImage
                  }
                  rating={movie.vote_average}
                  priority={index < 4} // Priority load for first 4 images
                />
              </div>
            ))
          ) : (
            // Empty State
            <div className="w-full flex items-center justify-center py-12">
              <div className="card-modern p-8 text-center">
                <p className="text-gray-400 text-base">No content available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;

import React, { useState, useMemo, useRef, useEffect } from "react";
import { FaPlay, FaTimes } from "react-icons/fa";

const MovieVideos = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);
  const scrollContainerRef = useRef(null);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Show left blur if scrolled from start
    setShowLeftBlur(scrollLeft > 10);

    // Show right blur if not at end
    setShowRightBlur(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initial check
      handleScroll();

      // Add scroll listener
      container.addEventListener("scroll", handleScroll);

      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [videos]);

  // Sort videos with proper priority logic
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const aIsTrailer = a.name.includes("Trailer") || a.type === "Trailer";
      const aIsTeaser = a.name.includes("Teaser") || a.type === "Teaser";
      const bIsTrailer = b.name.includes("Trailer") || b.type === "Trailer";
      const bIsTeaser = b.name.includes("Teaser") || b.type === "Teaser";

      // Both are trailers - maintain order
      if (aIsTrailer && bIsTrailer) {
        return 0;
      }

      // Both are teasers - maintain order
      if (aIsTeaser && bIsTeaser) {
        return 0;
      }

      // One is trailer, one is teaser - trailer comes first
      if (aIsTrailer && bIsTeaser) {
        return -1;
      }
      if (aIsTeaser && bIsTrailer) {
        return 1;
      }

      // One is trailer/teaser, other is not - trailer/teaser comes first
      if (aIsTrailer || aIsTeaser) {
        return -1;
      }
      if (bIsTrailer || bIsTeaser) {
        return 1;
      }

      // Neither is trailer/teaser - maintain original order
      return 0;
    });
  }, [videos]);

  return (
    <div className="mt-16">
      {/* Modal for video playback */}
      {showModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>
          {/* Modal content */}
          <div className="relative z-10 w-full max-w-3xl mx-auto p-4">
            <button
              className="absolute top-2 right-2 text-white text-3xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 transition"
              onClick={handleCloseModal}
              aria-label="Close video"
            >
              <FaTimes />
            </button>
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1`}
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
            <h3 className="text-xl font-bold text-white mt-4 mb-2">
              {selectedVideo.name}
            </h3>
            <p className="text-gray-400 text-sm">{selectedVideo.type}</p>
          </div>
        </div>
      )}

      {/* Video thumbnails - Horizontal Scroll */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-scroll pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "auto",
            scrollbarColor: "#3b82f6 #1f2937",
          }}
        >
          {sortedVideos.map((video) => (
            <div
              key={video.id}
              className="relative group cursor-pointer transition-all duration-300 flex-shrink-0 w-80"
              onClick={() => handleVideoClick(video)}
            >
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                <img
                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                  alt={video.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <FaPlay className="text-white text-4xl transition-transform duration-300 transform group-hover:scale-110 group-hover:drop-shadow-lg" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-white font-medium line-clamp-2">
                  {video.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{video.type}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Dynamic gradient fades */}
        {showLeftBlur && (
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent pointer-events-none transition-opacity duration-300"></div>
        )}
        {showRightBlur && (
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-gray-900 via-gray-900/50 to-transparent pointer-events-none transition-opacity duration-300"></div>
        )}
      </div>
    </div>
  );
};

export default MovieVideos;

import React, { useState } from "react";
import { FaPlay, FaTimes } from "react-icons/fa";

const MovieVideos = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

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
            <h3 className="text-xl font-bold text-white mt-4 mb-2">{selectedVideo.name}</h3>
            <p className="text-gray-400 text-sm">{selectedVideo.type}</p>
          </div>
        </div>
      )}

      {/* Video thumbnails grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`relative group cursor-pointer transition-all duration-300`}
            onClick={() => handleVideoClick(video)}
          >
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
              <img
                src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                alt={video.name}
                className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <FaPlay className="text-white text-4xl transition-transform duration-300 transform group-hover:scale-110 group-hover:drop-shadow-lg" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-white font-medium line-clamp-2">{video.name}</p>
              <p className="text-xs text-gray-400 mt-1">{video.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieVideos;

import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";

const MovieVideos = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="mt-16">
      <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <img
              src={`https://img.youtube.com/vi/${video.key}/0.jpg`}
              alt={video.name}
              className="w-full h-48 object-cover rounded-lg transition-transform duration-300 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaPlay className="text-white text-4xl" />
            </div>
            <p className="mt-2 text-sm text-gray-300 truncate">{video.name}</p>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={closeVideo}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
            <iframe
              width="100%"
              height="480"
              src={`https://www.youtube.com/embed/${selectedVideo.key}`}
              title={selectedVideo.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieVideos;

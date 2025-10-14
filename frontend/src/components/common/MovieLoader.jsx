import React from "react";
import { FaFilm } from "react-icons/fa";

const MovieLoader = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-20"}`}
    >
      <div className="relative">
        {/* Animated film reel */}
        <div className="relative w-24 h-24">
          {/* Outer circle with film strip pattern */}
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-spin-slow">
            {/* Film holes */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${i * 45}deg) translate(0, -36px)`,
                }}
              />
            ))}
          </div>

          {/* Inner rotating film icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <FaFilm className="text-blue-500 text-4xl" />
            </div>
          </div>

          {/* Middle spinning ring */}
          <div className="absolute inset-2 border-2 border-purple-500/30 rounded-full animate-spin-reverse" />
        </div>

        {/* Loading text */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-300 text-sm font-medium">Loading</span>
            <span className="flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: "0s" }}>
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.1s" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                .
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieLoader;

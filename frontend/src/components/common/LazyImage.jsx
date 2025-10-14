import React, { useState, useEffect, useRef } from "react";

/**
 * LazyImage - Optimized image component with lazy loading and skeleton state
 * Prevents browser from loading all images at once
 */
const LazyImage = ({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  width,
  height,
  objectFit = "cover",
  fallbackSrc = "/placeholder-movie.png",
  onLoad,
  onError,
  priority = false, // Set to true for above-the-fold images
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : null);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // If priority image, load immediately
    if (priority) {
      return;
    }

    // Set up Intersection Observer for lazy loading
    const options = {
      root: null,
      rootMargin: "50px", // Start loading 50px before image is visible
      threshold: 0.01,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !currentSrc) {
          setCurrentSrc(src);
          // Stop observing once we've started loading
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      });
    }, options);

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, currentSrc, priority]);

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div
          className={`absolute inset-0 skeleton ${skeletonClassName}`}
          style={{
            background:
              "linear-gradient(90deg, #1e293b 0%, #2d3748 50%, #1e293b 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      )}

      {/* Actual image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`
            ${isLoading ? "opacity-0" : "opacity-100"}
            transition-opacity duration-300 ease-in-out
            ${objectFit === "cover" ? "object-cover" : ""}
            ${objectFit === "contain" ? "object-contain" : ""}
            w-full h-full
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...rest}
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400 text-sm">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;

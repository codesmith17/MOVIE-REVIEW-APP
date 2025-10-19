import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * AdaptiveImage - TMDB Image component that adapts to network speed
 *
 * Automatically loads:
 * - Low-res (w185) on slow connections (2g, slow-2g, 3g)
 * - High-res (w500) on fast connections (4g, 5g)
 * - Dynamically upgrades/downgrades when connection changes
 */
const AdaptiveImage = ({
  path,
  alt,
  type = "poster", // 'poster' or 'backdrop'
  className = "",
  fallbackSrc = "/assets/no-image.svg",
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState("w185");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Define sizes based on image type
  const sizes = {
    poster: {
      low: "w185", // Slow connection
      medium: "w342", // Moderate connection
      high: "w500", // Fast connection
    },
    backdrop: {
      low: "w300",
      medium: "w780",
      high: "w1280",
    },
  };

  // Get appropriate image size based on network speed
  const getImageSize = () => {
    if (!("connection" in navigator)) {
      // If Network API not supported, use medium quality
      return sizes[type].medium;
    }

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = connection?.effectiveType;

    switch (effectiveType) {
      case "slow-2g":
      case "2g":
        return sizes[type].low;
      case "3g":
        return sizes[type].medium;
      case "4g":
      case "5g":
        return sizes[type].high;
      default:
        return sizes[type].medium;
    }
  };

  // Build TMDB image URL
  const buildImageUrl = (size) => {
    if (!path) return fallbackSrc;

    // If path is already a full URL, extract the path part and rebuild with new size
    if (path.startsWith("http")) {
      const match = path.match(/\/t\/p\/(w\d+|original)(\/.*)/);
      if (match) {
        const imagePath = match[2];
        return `https://image.tmdb.org/t/p/${size}${imagePath}`;
      }
      // If it's a full URL but not TMDB, return as is
      return path;
    }

    // If it's just a path, build the full URL
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  // Update image based on network speed
  const updateImage = () => {
    const newSize = getImageSize();
    setImageSize(newSize);
    setImageUrl(buildImageUrl(newSize));
    setIsLoading(true);
    setHasError(false);
  };

  // Initial load
  useEffect(() => {
    updateImage();
  }, [path, type]);

  // Listen for network changes
  useEffect(() => {
    if (!("connection" in navigator)) return;

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const handleConnectionChange = () => {
      console.log(`📶 Connection changed: ${connection.effectiveType}`);
      updateImage();
    };

    connection?.addEventListener("change", handleConnectionChange);

    return () => {
      connection?.removeEventListener("change", handleConnectionChange);
    };
  }, [path, type]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImageUrl(fallbackSrc);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      <img
        src={imageUrl || fallbackSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {/* Optional: Show connection indicator in dev mode */}
      {process.env.NODE_ENV === "development" && !hasError && (
        <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
          {imageSize}
        </div>
      )}
    </div>
  );
};

AdaptiveImage.propTypes = {
  path: PropTypes.string,
  alt: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["poster", "backdrop"]),
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
};

export default AdaptiveImage;

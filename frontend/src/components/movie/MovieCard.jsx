import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { LazyImage } from "../common";

const MovieCard = ({ id, title, year, type, image, rating, mediaType, priority = false }) => {
  const [dominantColor, setDominantColor] = useState(null);

  // Extract dominant color from image
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Create a proxied version or use the image directly
    img.src = image;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use smaller canvas for faster processing
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);

        // Sample from center area for better color detection
        const imageData = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0;
        let count = 0;

        // Sample every few pixels for better performance
        for (let i = 0; i < imageData.data.length; i += 16) {
          // Skip very dark pixels (likely background/borders)
          const pixelR = imageData.data[i];
          const pixelG = imageData.data[i + 1];
          const pixelB = imageData.data[i + 2];
          const brightness = (pixelR + pixelG + pixelB) / 3;
          
          if (brightness > 30) {
            r += pixelR;
            g += pixelG;
            b += pixelB;
            count++;
          }
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          console.log(`Extracted color for ${title}:`, { r, g, b });
          setDominantColor({ r, g, b });
        }
      } catch (error) {
        // CORS error or other issues - use a default based on title hash
        console.log('Could not extract color from image, using fallback');
        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const r = (hash * 137) % 256;
        const g = (hash * 239) % 256;
        const b = (hash * 193) % 256;
        setDominantColor({ r, g, b });
      }
    };

    img.onerror = () => {
      console.log('Image failed to load, using fallback color');
      // Use fallback color based on title
      const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const r = (hash * 137) % 256;
      const g = (hash * 239) % 256;
      const b = (hash * 193) % 256;
      setDominantColor({ r, g, b });
    };
  }, [image, title]);

  // Determine rating color and badge
  const getRatingBadge = (rating) => {
    if (!rating) return null;
    
    const ratingValue = typeof rating === 'number' ? rating : parseFloat(rating);
    let colorClass, bgClass;
    
    if (ratingValue >= 8) {
      colorClass = "text-emerald-400";
      bgClass = "bg-emerald-500/20 border-emerald-500/30";
    } else if (ratingValue >= 7) {
      colorClass = "text-green-400";
      bgClass = "bg-green-500/20 border-green-500/30";
    } else if (ratingValue >= 5) {
      colorClass = "text-amber-400";
      bgClass = "bg-amber-500/20 border-amber-500/30";
    } else {
      colorClass = "text-red-400";
      bgClass = "bg-red-500/20 border-red-500/30";
    }
    
    return { colorClass, bgClass, value: ratingValue.toFixed(1) };
  };

  const ratingBadge = getRatingBadge(rating);
  const displayMediaType = mediaType || type;
  const mediaTypeLabel = displayMediaType === 'movie' ? 'Movie' : displayMediaType === 'tv' ? 'TV Show' : displayMediaType;

  return (
    <Link to={`/${displayMediaType}/${id}`} className="group block perspective-1000">
      <div 
        className="movie-card-hover relative overflow-hidden w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] mx-auto min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex flex-col rounded-xl bg-gray-900/40 backdrop-blur-sm transition-all duration-500 ease-out group-hover:bg-gray-800/60 group-hover:shadow-2xl"
      >
        {/* Image Container */}
        <div className="relative w-full h-[190px] sm:h-[220px] md:h-[245px] lg:h-[270px] flex-shrink-0 overflow-hidden rounded-t-xl z-10">
          <LazyImage
            src={image}
            alt={title}
            className="w-full h-full transition-all duration-500"
            objectFit="cover"
            priority={priority}
          />
          
          {/* Subtle Gradient Overlay with shine */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Subtle top shine effect */}
          <div 
            className="absolute top-0 inset-x-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={dominantColor ? {
              background: `linear-gradient(to bottom, rgba(${Math.min(255, Math.floor(dominantColor.r * 1.3))}, ${Math.min(255, Math.floor(dominantColor.g * 1.3))}, ${Math.min(255, Math.floor(dominantColor.b * 1.3))}, 0.08), transparent)`,
            } : {}}
          />
          
          {/* Rating Badge */}
          {ratingBadge && (
            <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-0.5 sm:gap-1 ${ratingBadge.bgClass} backdrop-blur-md rounded-md sm:rounded-lg px-1.5 sm:px-2.5 py-1 sm:py-1.5 border ${ratingBadge.colorClass} font-bold text-[10px] sm:text-xs md:text-sm shadow-lg z-20`}>
              <FaStar className="text-[8px] sm:text-xs" />
              <span>{ratingBadge.value}</span>
            </div>
          )}
          
          {/* Media Type Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 badge badge-secondary text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 backdrop-blur-md z-20">
            {mediaTypeLabel}
          </div>
        </div>
        
        {/* Content */}
        <div className="content-glow flex-1 flex flex-col justify-start p-2 sm:p-3 md:p-4 bg-gradient-to-b from-gray-800/50 to-gray-900/80 rounded-b-xl min-h-[50px] sm:min-h-[70px] md:min-h-[80px] lg:min-h-[90px] z-10 relative overflow-hidden">
          {/* Subtle color gradient overlay only on bottom section */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={dominantColor ? {
              background: `linear-gradient(to top, rgba(${Math.min(255, Math.floor(dominantColor.r * 1.3))}, ${Math.min(255, Math.floor(dominantColor.g * 1.3))}, ${Math.min(255, Math.floor(dominantColor.b * 1.3))}, 0.25), rgba(${Math.min(255, Math.floor(dominantColor.r * 1.3))}, ${Math.min(255, Math.floor(dominantColor.g * 1.3))}, ${Math.min(255, Math.floor(dominantColor.b * 1.3))}, 0.12) 60%, transparent)`,
              mixBlendMode: 'overlay'
            } : {}}
          />
          <div className="relative z-10">
            <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-50 mb-1 sm:mb-1.5 md:mb-2 line-clamp-2 sm:line-clamp-3 leading-tight sm:leading-snug group-hover:text-white transition-colors duration-300">
              {title}
            </h3>
            {year && (
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">{year}</p>
            )}
          </div>
        </div>
        
        {/* Bright border glow on hover with dominant color */}
        <div 
          className="absolute inset-0 rounded-xl border-2 sm:border-[2.5px] md:border-[3px] border-transparent transition-all duration-500 pointer-events-none group-hover:shadow-lg z-20"
          style={dominantColor ? {
            borderColor: 'transparent',
          } : {}}
          onMouseEnter={(e) => {
            if (dominantColor) {
              const { r, g, b } = dominantColor;
              // Make it bright - boost by 1.5x
              const bright = {
                r: Math.min(255, Math.floor(r * 1.5)),
                g: Math.min(255, Math.floor(g * 1.5)),
                b: Math.min(255, Math.floor(b * 1.5))
              };
              e.currentTarget.style.borderColor = `rgba(${bright.r}, ${bright.g}, ${bright.b}, 0.6)`;
              e.currentTarget.style.boxShadow = `0 0 30px rgba(${bright.r}, ${bright.g}, ${bright.b}, 0.35), 0 0 20px rgba(${bright.r}, ${bright.g}, ${bright.b}, 0.25), 0 0 10px rgba(${bright.r}, ${bright.g}, ${bright.b}, 0.2)`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = '';
          }}
        />
      </div>
    </Link>
  );
};

export default MovieCard;

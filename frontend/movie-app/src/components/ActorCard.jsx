import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ActorCard = ({ id, name, profilePath, character, gender }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const male_image =
    "https://w7.pngwing.com/pngs/328/335/png-transparent-icon-user-male-avatar-business-person-profile.png";
  const female_image =
    "https://w7.pngwing.com/pngs/869/174/png-transparent-icon-user-female-avatar-business-person-profile-thumbnail.png";
  const defaultImage = gender === 1 ? female_image : male_image;

  useEffect(() => {
    if (profilePath) {
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/w200${profilePath}`;
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setIsLoading(false);
        setImageError(true);
      };
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [profilePath]);

  return (
    <Link to={`/celebrity/${id}`} className="group">
      <div className="w-32 text-center">
        {isLoading ? (
          <div className="w-32 h-32 rounded-lg bg-gray-700 animate-pulse mx-auto mb-2"></div>
        ) : (
          <img
            src={
              imageError
                ? defaultImage
                : `https://image.tmdb.org/t/p/w200${profilePath}`
            }
            alt={name}
            className="w-32 h-32 rounded-lg object-cover mx-auto mb-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
        )}
        {isLoading ? (
          <>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-1 animate-pulse mx-auto"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse mx-auto"></div>
          </>
        ) : (
          <>
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-gray-400 text-xs">{character}</p>
          </>
        )}
      </div>
    </Link>
  );
};

export default ActorCard;

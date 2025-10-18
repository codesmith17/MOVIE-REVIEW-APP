import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// import { FaStar } from "react-icons/fa";
import { MovieCard } from "../movie";
// import ActorCard from "./ActorCard";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

const PersonPage = () => {
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tmdb/person/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPersonData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching person data:", error);
        setError("Failed to load person data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id]);

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 md:h-10 bg-gray-700 rounded w-3/4 mx-auto mb-6 md:mb-8"></div>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 lg:space-x-12">
        <div className="w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 bg-gray-700 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 w-full space-y-4 md:space-y-6">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 md:h-32 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
      <div className="mt-12 md:mt-16">
        <div className="h-6 md:h-8 bg-gray-700 rounded w-1/2 mx-auto mb-6 md:mb-8"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-full">
              <div className="w-full aspect-[2/3] bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-3 md:h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="h-2 md:h-3 bg-gray-700 rounded w-1/2 mx-auto mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!personData) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">Person not found</h2>
          <p className="text-gray-400 mb-6">
            The person you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    birthday,
    place_of_birth,
    biography,
    profile_path,
    combined_credits,
    known_for_department,
    gender,
    also_known_as,
  } = personData;

  // Helper function to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(birthday);

  // Get filmography with proper null checks
  const getFilmography = () => {
    if (!combined_credits || !combined_credits.cast || combined_credits.cast.length === 0) {
      return [];
    }

    const movies = combined_credits.cast
      .filter((item) => item.media_type === "movie" && item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);

    const tvShows = combined_credits.cast
      .filter((item) => item.media_type === "tv" && item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);

    return [...movies, ...tvShows];
  };

  const filmography = getFilmography();
  const hasProfileImage = profile_path && profile_path.trim() !== "";
  const hasBiography = biography && biography.trim() !== "";

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen relative overflow-hidden">
      {/* Background Image */}
      {hasProfileImage && (
        <>
          <div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 md:opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${profile_path})`,
              backgroundAttachment: "fixed",
              zIndex: 0,
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-900 to-gray-900 pointer-events-none"
            style={{ zIndex: 1 }}
          ></div>
        </>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl relative z-10">
        {/* Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-center text-yellow-400 break-words px-2">
          {name || "Unknown Person"}
        </h1>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 lg:gap-12">
          {/* Profile Image */}
          <div className="w-48 sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
            {hasProfileImage ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${profile_path}`}
                alt={name}
                className="w-full rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/no-image.svg";
                }}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-yellow-400 mb-3 md:mb-4">
                Personal Information
              </h2>

              {known_for_department && (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Known For:</span>{" "}
                  <span className="text-gray-300">{known_for_department}</span>
                </div>
              )}

              {gender && (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Gender:</span>{" "}
                  <span className="text-gray-300">
                    {gender === 1 ? "Female" : gender === 2 ? "Male" : "Non-binary"}
                  </span>
                </div>
              )}

              {birthday ? (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Birthday:</span>{" "}
                  <span className="text-gray-300">
                    {new Date(birthday).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {age && <span className="text-gray-400"> ({age} years old)</span>}
                  </span>
                </div>
              ) : (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Birthday:</span>{" "}
                  <span className="text-gray-500 italic">Not available</span>
                </div>
              )}

              {place_of_birth ? (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Place of Birth:</span>{" "}
                  <span className="text-gray-300">{place_of_birth}</span>
                </div>
              ) : (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Place of Birth:</span>{" "}
                  <span className="text-gray-500 italic">Not available</span>
                </div>
              )}

              {also_known_as && also_known_as.length > 0 && (
                <div className="text-sm md:text-base">
                  <span className="font-semibold text-yellow-400">Also Known As:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {also_known_as.slice(0, 5).map((aka, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 px-2 py-1 rounded text-xs md:text-sm text-gray-300"
                      >
                        {aka}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Biography */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-yellow-400 mb-3 md:mb-4">
                Biography
              </h2>
              {hasBiography ? (
                <p className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-line">
                  {biography}
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-500 italic">
                  No biography available for this person.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filmography */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-yellow-400">
            Filmography
          </h2>
          {filmography.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
              {filmography.map((item) => (
                <MovieCard
                  key={`${item.id}-${item.media_type}`}
                  id={item.id}
                  title={item.title || item.name || "Untitled"}
                  year={
                    item.release_date
                      ? item.release_date.split("-")[0]
                      : item.first_air_date
                        ? item.first_air_date.split("-")[0]
                        : "N/A"
                  }
                  type={item.media_type}
                  mediaType={item.media_type}
                  image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  rating={item.vote_average || 0}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 md:p-12 text-center">
              <svg
                className="w-16 h-16 md:w-20 md:h-20 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
              <p className="text-lg md:text-xl text-gray-400">
                No filmography available for this person.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonPage;

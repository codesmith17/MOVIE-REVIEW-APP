/**
 * MoviePageSkeleton - Shimmer loading skeleton for movie detail page
 * Provides a smooth animated loading experience specifically for MoviePage
 */
const MoviePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0e27] text-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Movie Info Shimmer */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          {/* Poster Shimmer */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="w-64 lg:w-72 h-96 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl shadow-2xl shimmer"></div>
          </div>

          {/* Info Shimmer */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="h-10 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg w-3/4 mb-3 shimmer"></div>
              <div className="h-6 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-32 shimmer"></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg shimmer"
                ></div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-full shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-5/6 shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-4/6 shimmer"></div>
            </div>

            <div className="flex flex-wrap gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg shimmer"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Cast Shimmer */}
        <div className="mb-16">
          <div className="h-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-48 mb-6 shimmer"></div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-2 shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-28 shimmer"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Shimmer */}
        <div>
          <div className="h-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-56 mb-6 shimmer"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="w-full aspect-[2/3] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl mb-2 shimmer"></div>
                <div className="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded w-full shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            #1f2937 0%,
            #374151 20%,
            #1f2937 40%,
            #1f2937 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
};

export default MoviePageSkeleton;

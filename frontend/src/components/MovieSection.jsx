import MovieCard from "./MovieCard";

const defaultImage =
  "https://www.reelviews.net/resources/img/default_poster.jpg";

const MovieCardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse w-full">
    <div className="h-96 bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

const MovieSection = ({ title, movies, loading, error }) => (
  <section className="mb-20">
    <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-yellow-400 tracking-tight drop-shadow-lg">
      {title}
    </h2>
    <div className="movie-list grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
      {loading ? (
        [...Array(8)].map((_, index) => (
          <div key={index} className="w-full max-w-xs">
            <MovieCardSkeleton />
          </div>
        ))
      ) : error ? (
        <div className="col-span-full w-full max-w-md mx-auto">
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
            <p className="text-center">Error: {error}</p>
          </div>
        </div>
      ) : movies?.length > 0 ? (
        movies.map((movie) => (
          <div
            key={movie.id}
            className="w-full max-w-xs transform hover:scale-105 transition duration-300 ease-in-out bg-white/10 rounded-2xl shadow-xl backdrop-blur-md p-2"
          >
            <MovieCard
              id={movie.id}
              title={movie.title}
              year={new Date(movie.release_date).getFullYear()}
              type={movie.media_type || "movie"}
              mediaType={movie.media_type || "movie"}
              image={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : defaultImage
              }
              rating={movie.vote_average}
            />
          </div>
        ))
      ) : (
        <div className="col-span-full text-center">
          <p className="text-gray-400 text-xl">No movies found</p>
        </div>
      )}
    </div>
  </section>
);
export default MovieSection;

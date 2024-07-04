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
  <section className="mb-16">
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-yellow-400">
      {title}
    </h2>
    <div className="movie-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
      {loading ? (
        [...Array(8)].map((_, index) => (
          <div key={index} className="w-full max-w-sm">
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
            className="w-full max-w-sm transform hover:scale-105 transition duration-300 ease-in-out"
          >
            <MovieCard
              id={movie.id}
              title={movie.title}
              year={new Date(movie.release_date).getFullYear()}
              type="movie"
              image={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : defaultImage
              }
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

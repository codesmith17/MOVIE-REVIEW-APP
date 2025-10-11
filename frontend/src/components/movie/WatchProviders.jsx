const providerWebsites = {
  119: "https://www.primevideo.com/", // Amazon Prime Video
  561: "https://www.lionsgateplay.com/", // Lionsgate Play
  614: "https://www.myvi.in/", // VI movies and tv
  2053: "https://www.apple.com/apple-tv-plus/", // Lionsgate Play Apple TV Channel
  2074: "https://www.amazon.com/gp/video/storefront/", // Lionsgate Play Amazon Channel
  538: "https://www.plex.tv/", // Plex
  122: "https://www.hotstar.com/", // Hotstar
  // Add more provider IDs and their corresponding websites as needed
};

const WatchProviders = ({ providers }) => {
  if (!providers) return null;

  const renderProviders = (providerList, title) => {
    if (!providerList || providerList.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <div className="flex flex-wrap gap-4">
          {providerList.map((provider) => (
            <div key={provider.provider_id}>
              <a
                href={providerWebsites[provider.provider_id]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <img
                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-8 h-8 rounded"
                />
                <span>{provider.provider_name}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-8">
      <h3 className="text-2xl font-bold mb-4 text-yellow-400">
        Where to Watch in India
      </h3>
      {renderProviders(providers.flatrate, "Subscription")}
      {renderProviders(providers.free, "Free")}
      {renderProviders(providers.ads, "Ad-supported")}
      {providers.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          More information on TMDB
        </a>
      )}
      <div className="mt-4 text-gray-500 text-sm">
        Information provided by{" "}
        <a
          href="https://www.justwatch.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-400"
        >
          JustWatch.com
        </a>
        .
      </div>
    </div>
  );
};

export default WatchProviders;

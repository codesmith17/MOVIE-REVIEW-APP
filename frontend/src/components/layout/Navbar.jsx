import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/user/userSlice";
import { FaSearch, FaUser, FaBars, FaTimes, FaFilm } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const isAuthLoading = useSelector((state) => state.user.isAuthLoading);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movie-list?searchText=${searchQuery.trim()}&page=1`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch(logout());
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0e27]/98 backdrop-blur-xl border-b border-gray-800/50 shadow-xl"
          : "bg-[#0a0e27]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <FaFilm className="text-white text-sm" />
              </div>
              <span className="text-white text-lg font-bold tracking-tight hidden sm:block">
                CineSphere
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                About
              </Link>
            </div>
          </div>

          {/* Right: Search + User */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Desktop */}
            <form onSubmit={searchHandler} className="hidden md:block relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-48 lg:w-56 px-4 py-2 pl-9 bg-gray-800/60 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-gray-800 transition-all"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            </form>

            {/* User Section */}
            {isAuthLoading ? (
              // Show skeleton/placeholder while checking auth
              <div className="hidden md:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700/50 animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                {/* Desktop User */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to={`/user/${user?.username || user?.data?.username}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {user?.profilePicture || user?.data?.profilePicture ? (
                      <img
                        src={user?.profilePicture || user?.data?.profilePicture}
                        alt={user?.username || user?.data?.username}
                        className="w-8 h-8 rounded-full ring-2 ring-blue-500/40 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <FaUser className="text-white text-xs" />
                      </div>
                    )}
                    <span className="text-sm text-gray-300 font-medium">
                      {user?.username || user?.data?.username}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium"
                  >
                    Sign out
                  </button>
                </div>

                {/* Mobile User Avatar */}
                <Link to={`/user/${user?.username || user?.data?.username}`} className="md:hidden">
                  {user?.profilePicture || user?.data?.profilePicture ? (
                    <img
                      src={user?.profilePicture || user?.data?.profilePicture}
                      alt={user?.username || user?.data?.username}
                      className="w-8 h-8 rounded-full ring-2 ring-blue-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-sm px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                Sign in
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800/50 bg-[#0a0e27]/98 backdrop-blur-xl">
          <div className="px-6 py-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={searchHandler} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2.5 pl-10 bg-gray-800/60 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            </form>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/40 rounded-lg transition-all text-sm font-medium"
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/40 rounded-lg transition-all text-sm font-medium"
              >
                About
              </Link>

              {isAuthLoading ? (
                // Mobile loading skeleton
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-700/50 animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <>
                  <Link
                    to={`/user/${user?.username || user?.data?.username}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/40 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <FaUser className="text-xs" />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all text-sm font-medium text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium text-center"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

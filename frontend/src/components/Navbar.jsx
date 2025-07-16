import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/user/userSlice";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.data);

  const searchHandler = (e) => {
    e.preventDefault();
    const form = e.target;
    const searchInput = form.querySelector("#search-navbar");
    const searchQuery = searchInput.value.trim();
    navigate(`/movie-list?searchText=${searchQuery}&page=1`);
    form.querySelector("#search-navbar").value = "";
  };

  const handleLogout = () => {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
    dispatch(logout());
  };

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-blue-900 sticky top-0 z-50 border-b border-blue-900/80 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-2">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3917/3917032.png"
            className="h-8 w-8 rounded-full shadow border border-blue-500 bg-gray-900"
            alt="Logo"
          />
          <span className="self-center text-xl font-extrabold whitespace-nowrap text-white tracking-tight">
            Cine Critique
          </span>
        </Link>
        <div className="flex items-center md:order-2 gap-4">
          {user && (
            <div>
              <div className="md:hidden">
                <Link to={`/user/${user?.data?.username}`}>
                  (user?.data?.profilePicture)&&
                  {
                    <LazyLoadImage
                      src={user?.data?.profilePicture}
                      alt="Profile"
                      effect="blur"
                      className="w-8 h-8 rounded-full border border-blue-500 shadow"
                      wrapperProps={{
                        // If you need to, you can tweak the effect transition using the wrapper style.
                        style: { transitionDelay: "1s" },
                      }}
                      placeholderSrc="https://w7.pngwing.com/pngs/328/335/png-transparent-icon-user-male-avatar-business-person-profile.png"
                      // Add a small placeholder image
                    />
                  }
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4 md:ml-4">
                <Link to={`/user/${user?.data?.username}`}>
                  {user?.data && (
                    <LazyLoadImage
                      src={user?.data?.profilePicture}
                      alt="Profile"
                      effect="blur"
                      className="w-8 h-8 rounded-full border border-blue-500 shadow"
                      placeholderSrc="https://w7.pngwing.com/pngs/328/335/png-transparent-icon-user-male-avatar-business-person-profile.png"
                    />
                  )}
                </Link>
                <Link to={`/user/${user?.data?.username}`}>
                  <span className="text-white font-semibold text-base">{user?.data?.username}</span>{" "}
                </Link>
              </div>
            </div>
          )}
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 ml-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-300 ${
            isMenuOpen ? "block" : "hidden"
          } bg-gradient-to-b from-gray-900 to-blue-900 md:bg-transparent border-t border-blue-900/60 md:border-none mt-2 md:mt-0`}
          id="navbar-search"
        >
          <ul className="flex flex-col p-4 md:p-0 md:space-x-6 md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-transparent gap-2 md:gap-0">
            <li className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
              <form onSubmit={searchHandler} className="w-full max-w-xs">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    id="search-navbar"
                    className="block w-full py-1.5 pl-9 pr-3 text-sm text-white border border-blue-700/40 rounded-full bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow"
                    placeholder="Search..."
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-blue-300"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                </div>
              </form>
            </li>
            <li>
              <Link
                to="/"
                className="block py-1.5 px-5 text-white font-bold rounded-full hover:bg-blue-700/80 hover:text-white transition md:bg-transparent md:text-blue-400 md:hover:bg-blue-700/20 md:hover:text-white md:p-2"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-1.5 px-5 text-white font-bold rounded-full hover:bg-blue-700/80 hover:text-white transition md:bg-transparent md:text-blue-400 md:hover:bg-blue-700/20 md:hover:text-white md:p-2"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="block py-1.5 px-5 text-white font-bold rounded-full hover:bg-blue-700/80 hover:text-white transition md:bg-transparent md:text-blue-400 md:hover:bg-blue-700/20 md:hover:text-white md:p-2"
              >
                Services
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  onClick={handleLogout}
                  className="block py-1.5 px-5 text-white font-bold rounded-full hover:bg-red-600/80 hover:text-white transition md:bg-transparent md:text-red-400 md:hover:bg-red-700/20 md:hover:text-white md:p-2"
                >
                  Logout
                </Link>
              </li>
            )}
            <li>
              {!user && (
                <Link
                  to="/login"
                  className="block py-1.5 px-5 text-white font-bold rounded-full hover:bg-blue-700/80 hover:text-white transition md:bg-transparent md:text-blue-400 md:hover:bg-blue-700/20 md:hover:text-white md:p-2"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

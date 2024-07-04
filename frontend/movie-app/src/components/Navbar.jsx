import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout } from "./features/user/userSlice";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.data);
  console.log(user);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/auth/getUserData",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          dispatch(setUser(data));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [dispatch]);

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
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Cine Critique
          </span>
        </Link>
        <div className="flex items-center md:order-2">
          {user && (
            <div>
              <div className="md:hidden">
                <Link to={`/user/${user?.data.username}`}>
                  <img
                    src={user.data.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4 md:ml-4">
                <Link to={`/user/${user?.data.username}`}>
                  <img
                    src={user.data.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </Link>
                <Link to={`/user/${user?.data.username}`}>
                  <span className="text-white">{user.data.username}</span>{" "}
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
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "block" : "hidden"
          }`}
          id="navbar-search"
        >
          <ul className="flex flex-col p-4 md:p-0 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-gray-900 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <form onSubmit={searchHandler} className="mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                    <span className="sr-only">Search icon</span>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search-navbar"
                    className="block w-full p-2 pl-10 text-sm text-white border border-gray-600 rounded-lg bg-gray-800 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                  />
                </div>
              </form>
            </li>
            <li>
              <Link
                to="/"
                className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-500 md:p-0"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
              >
                Services
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  onClick={handleLogout}
                  className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
                >
                  Logout
                </Link>
              </li>
            )}
            <li>
              {!user && (
                <Link
                  to="/login"
                  className="block py-2 px-3 text-white rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0"
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

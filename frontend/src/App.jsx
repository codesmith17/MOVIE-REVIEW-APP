import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import MovieList from "./components/MovieList";
import MoviePage from "./components/MoviePage";
import Signup from "./components/Signup";
import SingleReview from "./components/SingleReview";
import { ToastContainer } from "react-toastify";
import HomePage from "./components/HomePage";
import "react-toastify/dist/ReactToastify.css";
import UserPage from "./components/UserPage";
import ActivityPage from "./components/ActivityPage";
import MovieSpecificActivity from "./components/MovieSpecificActivity";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import NotFound from "./components/NotFound";
import ListDetailsPage from "./components/ListDetailPage";
import PersonPage from "./components/PersonPage";
import { useDispatch } from "react-redux";
import { setUser } from "./components/features/user/userSlice";
import TorrentStream from "./components/TorrentStream";
// import LobbyScreen from "./components/LobbyScreen";
// import RoomPage from "./components/RoomPage";
// import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/getUserData`,
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
        // Fail silently
      }
    };
    fetchUserData();
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Navbar />
        {navigator.onLine ? (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/upcoming" element={<HomePage />} />
            <Route path="/movie-list" element={<MovieList />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/movie-page/:imdbID/:reviewID"
              element={<SingleReview />}
            />
            <Route
              path="/reset-password/:resetToken"
              element={<ResetPassword />}
            />

            <Route path="/:mediaType/:id" element={<MoviePage />} />
            <Route path="/celebrity/:id" element={<PersonPage />} />
            <Route path="/user/:username" element={<UserPage />} />
            <Route path="/activity/:username" element={<ActivityPage />} />
            <Route path="/movie-activity/:movieId/:username" element={<MovieSpecificActivity />} />
            <Route path="/list/:listId" element={<ListDetailsPage />} />
            <Route path="/torrent-stream" element={<TorrentStream />} />
            {/* <Route path="/video-call" element={<LobbyScreen />} />
            <Route path="/room/:roomId" element={<RoomPage />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        ) : (
          <p>NO INTERNET CONNECTION</p>
        )}
      </BrowserRouter>
    </>
  );
};

export default App;

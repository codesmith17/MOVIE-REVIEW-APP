import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setUser, setAuthLoading } from "./components/features/user/userSlice";
import axiosInstance from "./utils/axiosConfig";

// Layout
import { Navbar } from "./components/layout";

// Auth
import { Login, Signup, ForgotPassword, ResetPassword } from "./components/auth";

// Pages
import {
  HomePage,
  UserPage,
  ActivityPage,
  PersonPage,
  ListDetailPage,
  ReviewsListPage,
  FollowersListPage,
  FollowingListPage,
} from "./components/pages";

// Movie
import { MovieList, MoviePage } from "./components/movie";

// Reviews
import { SingleReview } from "./components/reviews";

// Activity
import { MovieSpecificActivity } from "./components/activity";

// Common
import { NotFound } from "./components/common";
// import LobbyScreen from "./components/LobbyScreen";
// import RoomPage from "./components/RoomPage";
// import io from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if cookies exist before making the request
      const hasAccessToken = document.cookie.includes("access_token=");
      const hasRefreshToken = document.cookie.includes("refresh_token=");

      // If no tokens at all, skip the request
      if (!hasAccessToken && !hasRefreshToken) {
        console.log("No auth tokens found. Skipping user data fetch.");
        dispatch(setAuthLoading(false));
        return;
      }

      try {
        // Use axiosInstance which has token refresh interceptor
        const response = await axiosInstance.get("/api/auth/getUserData");

        if (response.data && response.data.data) {
          dispatch(setUser(response.data));
        } else {
          // Not authenticated, stop loading
          dispatch(setAuthLoading(false));
        }
      } catch (error) {
        // If 401 or other error, user is not authenticated - fail silently
        console.log("User not authenticated on page load");
        dispatch(setAuthLoading(false));
      }
    };
    fetchUserData();
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Navbar />
        {navigator.onLine ? (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/upcoming" element={<HomePage />} />
            <Route path="/movie-list" element={<MovieList />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/movie-page/:imdbID/:reviewID" element={<SingleReview />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

            <Route path="/:mediaType/:id" element={<MoviePage />} />
            <Route path="/celebrity/:id" element={<PersonPage />} />
            <Route path="/user/:username" element={<UserPage />} />
            <Route path="/user/:username/reviews" element={<ReviewsListPage />} />
            <Route path="/user/:username/followers" element={<FollowersListPage />} />
            <Route path="/user/:username/following" element={<FollowingListPage />} />
            <Route path="/activity/:username" element={<ActivityPage />} />
            <Route path="/movie-activity/:movieId/:username" element={<MovieSpecificActivity />} />
            <Route path="/list/:listId" element={<ListDetailPage />} />
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

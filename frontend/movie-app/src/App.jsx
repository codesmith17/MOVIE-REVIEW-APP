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
import { UserProvider } from "./components/UserContext";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import NotFound from "./components/NotFound";
const App = () => {
  return (
    <UserProvider>
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
            <Route path="/user/:username" element={<UserPage />} />
            <Route path="/movie-page/:watchmodeID" element={<MoviePage />} />
            <Route component={NotFound} />
          </Routes>
        ) : (
          <p>NO INTERNET CONNECTION</p>
        )}
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;

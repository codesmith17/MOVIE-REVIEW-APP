import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import MovieList from "./components/MovieList";
import MoviePage from "./components/MoviePage";
import Signup from "./components/Signup";
import SingleReview from "./components/SingleReview";
import { ToastContainer, toast } from "react-toastify";
import HomePage from "./components/HomePage";
import "react-toastify/dist/ReactToastify.css";
import UserPage from "./components/UserPage";
import { UserProvider } from "./components/UserContext";

const App = () => {
  return (
    <>
      {" "}
      <UserProvider>
        <ToastContainer />
        <BrowserRouter>
          <Navbar />

          {navigator.onLine ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upcoming" element={<HomePage />} />
              <Route path="/movie-list" element={<MovieList />} />
              <Route
                path="/movie-page/:imdbID/:reviewID"
                element={<SingleReview />}
              />
              <Route path="/user/:userID" element={<UserPage />}></Route>
              <Route path="/movie-page/:imdbID" element={<MoviePage />} />
            </Routes>
          ) : (
            <p>NO INTERNET CONNECTION</p>
          )}
        </BrowserRouter>
      </UserProvider>
    </>
  );
};

export default App;

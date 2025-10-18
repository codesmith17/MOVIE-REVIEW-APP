import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../features/user/userSlice"; // Adjust the path as needed
import axiosInstance from "../../utils/axiosConfig"; // Use axios with interceptor

const Home = () => {
  const [remember, setRemember] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [boxChecked, setBoxChecked] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);

  const handleRememberCredentials = (e) => {
    setRemember(e.target.checked);
    setBoxChecked(e.target.checked);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email") || "";
    const savedPassword = localStorage.getItem("password") || "";
    const savedBoxChecked = localStorage.getItem("boxChecked") === "true";

    setFormData({ email: savedEmail, password: savedPassword });
    setBoxChecked(savedBoxChecked);
    setRemember(savedBoxChecked);

    // Check if user is already logged in (from App.jsx getUserData call)
    if (user && user.data && user.data.username) {
      // User is already authenticated, redirect to home
      navigate("/upcoming");
    }
  }, [navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/api/auth/signin", formData);

      console.log(response.data);
      if (response.data && response.data.message === "Authentication successful.") {
        // Both access and refresh tokens are now in httpOnly cookies (maximum security)
        // No tokens in localStorage - safe from XSS attacks!
        // Wrap user data to match the structure from getUserData
        dispatch(setUser({ data: response.data.user }));

        if (remember) {
          localStorage.setItem("email", formData.email);
          localStorage.setItem("password", formData.password);
          localStorage.setItem("boxChecked", remember);
        } else {
          if (localStorage.getItem("email") != null && localStorage.getItem("email") != "") {
            localStorage.removeItem("email");
          }
          if (localStorage.getItem("password") != null && localStorage.getItem("password") != "") {
            localStorage.removeItem("password");
          }
          if (
            localStorage.getItem("boxChecked") != null &&
            localStorage.getItem("boxChecked") != ""
          ) {
            localStorage.removeItem("boxChecked");
          }
          localStorage.removeItem("password");
          localStorage.removeItem("boxChecked");
        }
        toast.success("LOGIN SUCCESSFUL!\nWELCOME!!!", {
          toastId: "success1",
        });
        navigate("/upcoming");
      } else {
        // Clear any old cookies on signin failure
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh_token=; path=/api/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        toast.error("Unable to sign in. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      // Clear any old cookies on signin failure
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refresh_token=; path=/api/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // Generic error message - don't reveal if user exists or not
      toast.error("Unable to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col justify-center items-center pt-16">
      <section className="bg-gray-900 text-gray-100 w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-100">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    id="email"
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="email..."
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-100"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        checked={boxChecked}
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        onChange={handleRememberCredentials}
                        className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-primary-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="remember" className="text-gray-400">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <Link
                    to={"/forgot-password"}
                    className="text-sm font-medium text-primary-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-500 border border-primary-400 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Sign in
                </button>
                <p className="text-sm font-light text-gray-400 text-center">
                  Don't have an account yet?{" "}
                  <Link to="/signup" className="font-medium text-primary-400 hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { UserContext } from "./UserContext";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const handleChange = (e) => {
    setEmail(e.target.value.trim());
  };
  useEffect(() => {
    if (user) {
      navigate("/upcoming");
    }
  }, []);
  const onSubmit = async (e) => {
    e.preventDefault();

    // Replace with your actual API call to send reset password email
    const response = await fetch(
      "https://movie-review-app-do6z.onrender.com/api/auth/forgotPassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    if (data && data.message === "User not found") {
      toast.error("SUCH EMAIL HASN'T BEEN REGISTERED!");
      return;
    }
    if (data && data.message === "Reset email sent!") {
      toast.success("A password reset email has been sent to your inbox!");
      // navigate("/login");
      // localStorage.setItem("resetEmail", email);
    } else {
      toast.error(data.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col justify-center items-center pt-16">
      <section className="bg-gray-900 text-gray-100 w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                Forgot Your Password?
              </h1>
              <p className="text-gray-400 text-base mb-6">
                Enter the email address associated with your account and we'll
                send you instructions to reset your password.
              </p>
              <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-100"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    id="email"
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="email..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-500 border border-primary-400 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Send Reset Instructions
                </button>
                <p className="text-sm font-light text-gray-400 text-center">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary-400 hover:underline"
                  >
                    Sign in
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

export default ForgotPassword;

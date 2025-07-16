// ForgotPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUser } from "./features/user/userSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);

  useEffect(() => {
    if (user) {
      navigate("/upcoming");
    }
  }, [user, navigate]);

  const handleChange = (e) => setEmail(e.target.value.trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data?.message === "User not found") {
        toast.error("SUCH EMAIL HASN'T BEEN REGISTERED!");
      } else if (data?.message === "Reset email sent!") {
        toast.success("A password reset email has been sent to your inbox!");
      } else {
        toast.error(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
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
                  className="w-full text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5"
                >
                  Send Reset Instructions
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;

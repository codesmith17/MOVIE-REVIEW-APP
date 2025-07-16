import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import crypto from "crypto-js";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const secretKey = "krishna170902";
  const decryptedUsername = crypto.AES.decrypt(
    decodeURIComponent(resetToken),
    secretKey
  ).toString(crypto.enc.Utf8);
  //   console.log(decryptedUsername);
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Replace with your actual API call to reset the password
    const response = await fetch(
      `${API_BASE_URL}/api/auth/resetPassword`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          username: decryptedUsername,
          resetToken,
        }),
      }
    );

    const data = await response.json();
    if (data && data.message === "TRY TO USE SOME NEW PASSWORD") {
      toast.error(data.message);
      return;
    }
    if (data && data.message === "Password reset successfully!") {
      toast.success("Your password has been reset successfully!");
      navigate("/login");
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
                Reset Your Password
              </h1>
              <p className="text-gray-400 text-base mb-6">
                Enter your new password below.
              </p>
              <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-100"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    id="password"
                    onChange={handleChangePassword}
                    className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="New password..."
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-100"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    value={confirmPassword}
                    id="confirm-password"
                    onChange={handleChangeConfirmPassword}
                    className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Confirm new password..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-500 border border-primary-400 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;

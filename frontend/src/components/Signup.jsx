import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Signup = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [termsChecked, setTermsChecked] = useState(false);
  const termsCheckboxRef = useRef(null);

  const handleChange = (e) => {
    console.log(formData);
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!termsChecked) {
      toast.error("YOU HAVE TO AGREE OUR TERMS AND CONDITIONS");
      console.log(termsCheckboxRef);
      termsCheckboxRef.current.focus();
      return;
    }
    fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: formData, checked: termsChecked }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message === "User registered.") {
          toast.success(
            "USER HAS BEEN REGISTERED SIGN-IN USING YOUR CREDENTIALS"
          );
          navigate("/");
        } else {
          toast.error(res.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred. Please try again later.");
      });
  };

  return (
    <section className="bg-gray-900 text-gray-100 min-h-screen flex flex-col justify-center items-center pt-16">
      <ToastContainer />
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8 mt-16">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create an account
        </h1>
        <form className="space-y-6" onSubmit={submitHandler}>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-100"
            >
              Your name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-100"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="johndoe"
              required
            />
          </div>
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
              onChange={handleChange}
              id="email"
              className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="name@company.com"
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
              onChange={handleChange}
              id="password"
              placeholder="••••••••"
              className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-100"
            >
              Confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              id="confirmPassword"
              placeholder="••••••••"
              className="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              required
            />
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                onChange={() => setTermsChecked(!termsChecked)}
                ref={termsCheckboxRef}
                className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-primary-300"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-light text-gray-400">
                I accept the{" "}
                <Link
                  className="font-medium text-primary-400 hover:underline"
                  to={"/auth/terms"}
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary-500 border border-primary-400 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Create an account
          </button>
          <p className="text-sm font-light text-gray-400 text-center">
            Already have an account?{" "}
            <Link
              to={"/"}
              className="font-medium text-primary-400 hover:underline"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Signup;

import React, { useState, useEffect } from "react";
import { FaSpinner, FaUpload, FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const UserPage = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  let user = useSelector((state) => state.user.data);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/auth/getOthersData/${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error("Failed to fetch user data");
          }
          return;
        }

        const data = await response.json();
        if (!data || !data.data) {
          throw new Error("User data not found");
        }
        setFetchedUserData(data.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.data && user.data.username === username) {
      setFetchedUserData(user.data);
    } else {
      fetchUserData();
    }
  }, [username, user]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/upload-profile-picture",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setFetchedUserData((prevData) => ({
        ...prevData,
        profilePicture: data.profilePictureUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
      {isLoading ? (
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      ) : fetchedUserData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {fetchedUserData.profilePicture ? (
                <img
                  src={fetchedUserData.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <FaUser className="text-4xl text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {fetchedUserData.username}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {`${fetchedUserData.email}(not visible to others)`}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Name: {fetchedUserData.name}
            </p>
          </div>
          <div className="flex justify-around mb-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800 dark:text-white">
                {fetchedUserData.followers}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Followers
              </span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800 dark:text-white">
                {fetchedUserData.following}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Following
              </span>
            </div>
          </div>
          {user?.data && user.data.username === username && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <FaUpload className="mr-2" />
                <span>
                  {selectedFile ? selectedFile.name : "Choose a file"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                  !selectedFile || isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isUploading ? (
                  <FaSpinner className="animate-spin inline mr-2" />
                ) : (
                  <FaUpload className="inline mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload Profile Picture"}
              </motion.button>
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}% Uploaded
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : notFound ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center"
        >
          <p className="text-2xl text-red-500">No such user found!</p>
        </motion.div>
      ) : null}
    </div>
  );
};

export default UserPage;

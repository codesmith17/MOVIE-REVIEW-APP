import React, { useState, useEffect, useContext } from "react";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { UserContext } from "./UserContext";

const UserPage = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useContext(UserContext);

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
        console.log(response);
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

    // Add null check here
    if (user?.data && user.data.username === username) {
      setFetchedUserData(user.data);
    } else {
      fetchUserData();
    }
  }, [username, user]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      {isLoading ? (
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      ) : (
        fetchedUserData && (
          <div className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img
                src={fetchedUserData.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full mr-4 shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {fetchedUserData.username}
                </h2>
                <p className="text-gray-600">{fetchedUserData.email}</p>
                <p className="text-gray-600">Name: {fetchedUserData.name}</p>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-4">
              <div className="flex items-center">
                <span className="font-bold mr-2 text-gray-800 dark:text-white">
                  Followers:
                </span>
                <span className="text-gray-800 dark:text-white">
                  {fetchedUserData.followers}
                </span>
              </div>
              <div className="flex items-center mt-2">
                <span className="font-bold mr-2 text-gray-800 dark:text-white">
                  Following:
                </span>
                <span className="text-gray-800 dark:text-white">
                  {fetchedUserData.following}
                </span>
              </div>
            </div>
          </div>
        )
      )}
      {notFound && (
        <div className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl text-red-500">No such user found!</p>
        </div>
      )}
    </div>
  );
};

export default UserPage;

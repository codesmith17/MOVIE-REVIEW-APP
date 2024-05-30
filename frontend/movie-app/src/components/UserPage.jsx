import React, { useState, useEffect, useContext } from "react";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { UserContext } from "./UserContext"; // Assuming UserContext is defined elsewhere

const UserPage = () => {
  const { userID } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useContext(UserContext); // Access user data from UserContext

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/auth/getOthersData/${userID}`,
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
          return; // Exit the function if not successful
        }

        const data = await response.json();
        if (!data || !data.data) {
          throw new Error("User data not found");
        }
        setUserData(data.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setNotFound(true); // Set notFound if any error occurs during fetch
      } finally {
        setIsLoading(false);
      }
    };

    // Check if the user exists in the UserContext and matches the userID
    if (user && user.data._id === userID) {
      setUserData(user.data); // Use data from UserContext if available
    } else {
      fetchUserData(); // Fetch data from backend if needed
    }
  }, [userID]); // Dependency array to trigger fetch on userID change

  if (isLoading || !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-2xl text-red-500">No such user found!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <img
          src={userData.profilePicture}
          alt="Profile"
          className="w-20 h-20 rounded-full mr-4 shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold">{userData.username}</h2>
          <p className="text-gray-600">{userData.email}</p>
          <p className="text-gray-600">Name: {userData.name}</p>
        </div>
      </div>
      <div className="border-t border-gray-300 pt-4">
        <div className="flex items-center">
          <span className="font-bold mr-2">Followers:</span>
          <span>{userData.followers}</span>
        </div>
        <div className="flex items-center mt-2">
          <span className="font-bold mr-2">Following:</span>
          <span>{userData.following}</span>
        </div>
      </div>
    </div>
  );
};

export default UserPage;

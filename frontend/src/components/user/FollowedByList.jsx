import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function FollowedByList({ currentUser, profileUser, maxDisplayed = 3 }) {
  const [friendsThatFollow, setFriendsThatFollow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriendsThatFollow = async () => {
      if (!currentUser || !profileUser || currentUser === profileUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/auth/getFriendsThatFollow/${currentUser}/${profileUser}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch mutual followers");
        }
        const data = await response.json();
        setFriendsThatFollow(data.myFriends);
      } catch (error) {
        console.error("Error fetching friends that follow:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsThatFollow();
  }, [currentUser, profileUser]);

  const renderFollowedBy = () => {
    console.log(friendsThatFollow);
    if (friendsThatFollow.length === 0) {
      return "No mutual followers";
    }

    const displayNames = friendsThatFollow.slice(0, maxDisplayed).join(", ");
    const remainingCount = friendsThatFollow.length - maxDisplayed;

    if (remainingCount > 0) {
      return `${displayNames}, and ${remainingCount} more`;
    } else {
      return displayNames;
    }
  };

  if (isLoading) {
    return <div>Loading mutual followers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser || !profileUser || currentUser === profileUser) {
    return null;
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-semibold text-gray-700">Followed by</h3>
      <p className="text-sm text-gray-600">{renderFollowedBy()}</p>
    </div>
  );
}

FollowedByList.propTypes = {
  currentUser: PropTypes.string.isRequired,
  profileUser: PropTypes.string.isRequired,
  maxDisplayed: PropTypes.number,
};

export default FollowedByList;

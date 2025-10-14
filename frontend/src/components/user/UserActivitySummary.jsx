import React, { useState, useEffect } from "react";
import { FaEye, FaHeart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const UserActivitySummary = ({ username, isCurrentUser }) => {
  const [activityStats, setActivityStats] = useState({
    reviewedCount: 0,
    likedCount: 0,
    averageRating: 0,
    totalRated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        setLoading(true);

        // Fetch user reviews to get reviewed count and calculate average rating
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/api/review/getReviews/${username}`,
        );

        let reviewedCount = 0;
        let totalRated = 0;
        let totalRatingSum = 0;

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          reviewedCount = reviewsData.reviews?.length || 0;

          // Calculate average rating
          const ratingsData =
            reviewsData.reviews?.filter((review) => review.rating > 0) || [];
          totalRated = ratingsData.length;
          totalRatingSum = ratingsData.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
        }

        const averageRating =
          totalRated > 0 ? (totalRatingSum / totalRated).toFixed(1) : 0;

        setActivityStats({
          reviewedCount,
          likedCount: 0, // Placeholder - would need API endpoint for movie likes by user
          averageRating,
          totalRated,
        });
      } catch (error) {
        console.error("Error fetching activity stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchActivityStats();
    }
  }, [username]);

  const ActivityCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-750 transition-colors"
    >
      <div
        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color}`}
      >
        <Icon className="text-2xl text-white" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm font-medium">{label}</div>
    </motion.div>
  );

  const RatingDisplay = ({ rating, totalRated, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-750 transition-colors"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
        <FaStar className="text-2xl text-white" />
      </div>
      <div className="text-white mb-2">
        <div className="text-2xl font-bold">{rating > 0 ? rating : "—"}</div>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-lg ${
                star <= Math.round(rating) ? "text-yellow-400" : "text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="text-gray-400 text-sm font-medium">
        Avg Rating ({totalRated} rated)
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-2xl p-6 animate-pulse"
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white mb-6 text-center"
      >
        {isCurrentUser ? "Your Activity" : `${username}'s Activity`}
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          icon={FaEye}
          label="Reviewed"
          value={activityStats.reviewedCount}
          color="bg-green-600"
          delay={0}
        />

        <ActivityCard
          icon={FaHeart}
          label="Liked"
          value={activityStats.likedCount}
          color="bg-red-600"
          delay={0.1}
        />

        <RatingDisplay
          rating={activityStats.averageRating}
          totalRated={activityStats.totalRated}
          delay={0.2}
        />
      </div>
    </div>
  );
};

export default UserActivitySummary;

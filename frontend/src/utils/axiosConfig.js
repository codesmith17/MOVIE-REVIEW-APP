import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

// Create axios instance with credentials to send cookies
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Send httpOnly cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(success);
    }
  });

  failedQueue = [];
};

// Response interceptor - Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept errors from auth routes (let components handle them)
    if (
      originalRequest.url.includes("/api/auth/signin") ||
      originalRequest.url.includes("/api/auth/signup") ||
      originalRequest.url.includes("/api/auth/forgot") ||
      originalRequest.url.includes("/api/auth/reset") ||
      originalRequest.url.includes("/api/auth/getUserData")
    ) {
      // These are authentication errors - let component handle them
      console.log(`🚫 Not intercepting auth route: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    // If error is 401 (token expired) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Special handling for refresh-token endpoint failure
      if (originalRequest.url.includes("/api/auth/refresh-token")) {
        console.error("Refresh token expired. Redirecting to login...");
        if (window.location.pathname !== "/signin" && window.location.pathname !== "/") {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // After refresh succeeds, retry the original request
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.log(`🔄 Attempting token refresh for request: ${originalRequest.url}`);

      try {
        // Try to refresh the access token using refresh token cookie
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          {
            withCredentials: true, // Send refresh token cookie
          }
        );

        console.log("✅ Token refresh successful");

        // New access token is now set as httpOnly cookie by backend
        // Process queued requests
        processQueue(null, true);

        isRefreshing = false;

        // Retry the original request (with new access token cookie)
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - log out user
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear cookies on refresh failure
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh_token=; path=/api/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Only redirect if user is on a protected page
        // Don't redirect if on public pages or already on auth pages
        const publicPages = ["/", "/login", "/signup", "/forgot-password", "/upcoming"];
        const currentPath = window.location.pathname;
        const isPublicPage =
          publicPages.includes(currentPath) ||
          currentPath.startsWith("/reset-password") ||
          currentPath.startsWith("/movie/") ||
          currentPath.startsWith("/tv/") ||
          currentPath.startsWith("/celebrity/") ||
          currentPath.startsWith("/user/") ||
          currentPath.startsWith("/list/");

        if (!isPublicPage) {
          console.log("Token refresh failed. Redirecting to login...");
          window.location.href = "/login";
        } else {
          console.log("Token refresh failed on public page. No redirect needed.");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

/**
 * CSRF Token Management
 * Handles fetching and caching CSRF tokens for secure requests
 */

let csrfToken = null;

/**
 * Fetch CSRF token from the server
 * @returns {Promise<string>} The CSRF token
 */
export const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL || ""}/api/csrf-token`, {
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }

    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

/**
 * Get the current CSRF token, fetching it if necessary
 * @returns {Promise<string>} The CSRF token
 */
export const getCsrfToken = async () => {
  if (!csrfToken) {
    await fetchCsrfToken();
  }
  return csrfToken;
};

/**
 * Clear the cached CSRF token (e.g., after logout)
 */
export const clearCsrfToken = () => {
  csrfToken = null;
};

/**
 * Get CSRF headers for requests
 * @returns {Promise<object>} Headers object with CSRF token
 */
export const getCsrfHeaders = async () => {
  const token = await getCsrfToken();
  return {
    "x-csrf-token": token,
  };
};

export default {
  fetchCsrfToken,
  getCsrfToken,
  clearCsrfToken,
  getCsrfHeaders,
};

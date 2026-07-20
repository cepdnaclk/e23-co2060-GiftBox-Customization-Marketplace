// Utility for making authenticated API calls with JWT

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem("accessToken", refreshData.accessToken);

        // Retry original request with new token
        headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    } else {
      // No refresh token, redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
  }

  return response;
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem("accessToken") !== null;
};

// Function to logout
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  window.location.href = "/login";
};

// Function to get current user info
export const getCurrentUser = () => {
  return {
    userId: localStorage.getItem("userId"),
    role: localStorage.getItem("role"),
    isAuthenticated: isAuthenticated(),
  };
};
// Utility for authenticated API calls with automatic JWT handling

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const authenticatedFetch = async (url, options = {}, navigate = null) => {
  const token = localStorage.getItem("token");
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  console.log("Token:", token);
  console.log("Making request to:", fullUrl);

  if (!token) {
    console.warn("No token found. Redirecting to login.");
    if (navigate) {
      navigate("/login");
    }
    throw new Error("Your session has expired. Please login again.");
  }

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log("Response Status:", response.status);
  const responseText = await response.clone().text();
  console.log("Response Body:", responseText);

  if (response.status === 401) {
    console.error("401 Unauthorized - clearing token and redirecting to login");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (navigate) {
      navigate("/login");
    }
    throw new Error("Your session has expired. Please login again.");
  }

  if (!response.ok) {
    let errorMessage = "API request failed";
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return {};
  }
};

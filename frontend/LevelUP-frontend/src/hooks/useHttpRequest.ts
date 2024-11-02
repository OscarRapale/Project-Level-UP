import { useState, useCallback } from "react";
import axios from "axios";

// Interface for HTTP request properties
interface HttpRequestProps<B> {
  url: string; // URL for the HTTP request
  method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH"; // HTTP method, default is "GET"
  body?: B; // Request body, optional
}

// Interface for HTTP request result
interface HttpRequestResult<T, B> {
  data: T | null; // Response data, initially null
  loading: boolean; // Loading state, initially false
  error: string | null; // Error message, initially null
  sendRequest: (config?: Partial<HttpRequestProps<B>>) => Promise<T>; // Function to send the HTTP request
}

// Custom hook for making HTTP requests
const useHttpRequest = <T, B>({
  url,
  method = "GET",
  body,
}: HttpRequestProps<B>): HttpRequestResult<T, B> => {
  const [data, setData] = useState<T | null>(null); // State for response data
  const [error, setError] = useState<string | null>(null); // State for error message
  const [loading, setLoading] = useState(false); // State for loading status

  // Function to send the HTTP request
  const sendRequest = useCallback(
    async (config?: Partial<HttpRequestProps<B>>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        const response = await axios({
          url: config?.url || url,
          method: config?.method || method,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }), // Add Authorization header if token exists
          },
          data: config?.body || body,
        });

        setData(response.data); // Set response data
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.msg || "An error occurred"); // Set error message from response
        } else {
          setError("An unexpected error occurred"); // Set generic error message
        }
        throw err;
      } finally {
        setLoading(false); // Set loading to false after request completes
      }
    },
    [url, method, body]
  );

  return { data, loading, error, sendRequest }; // Return data, loading, error, and sendRequest function
};

export default useHttpRequest;

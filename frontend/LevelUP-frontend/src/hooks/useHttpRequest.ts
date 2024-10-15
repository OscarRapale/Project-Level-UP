import { useState, useCallback } from "react";
import axios from "axios";

interface HttpRequestProps<B> {
  url: string;
  method?: "GET" | "POST";
  body?: B;
}

interface HttpRequestResult<T, B> {
  data: T | null;
  loading: boolean;
  error: string | null;
  sendRequest: (config?: Partial<HttpRequestProps<B>>) => Promise<T>;
}

const useHttpRequest = <T, B>({
  url,
  method = "GET",
  body,
}: HttpRequestProps<B>): HttpRequestResult<T, B> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = useCallback(async (config?: Partial<HttpRequestProps<B>>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        url: config?.url || url,
        method: config?.method || method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: config?.body || body,
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.msg || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, body]);

  return { data, loading, error, sendRequest };
};

export default useHttpRequest;

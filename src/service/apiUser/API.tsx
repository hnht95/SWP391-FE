// src/services/API.jsx
import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
    request: err?.request,
  });

  let errorMessage = err?.message || "Unknown error";
  if (err?.response) {
    if (typeof err.response.data === "string") {
      if (err.response.data.includes("MulterError: Unexpected field")) {
        errorMessage =
          "Invalid file field names. Please check poster and trailer fields.";
      } else {
        errorMessage = "Server returned an unexpected response";
      }
    } else {
      const responseData: unknown = err.response.data;
      if (typeof responseData === "object" && responseData !== null) {
        const rd = responseData as Record<string, unknown>;
        if (rd.message && typeof rd.message === "string") {
          errorMessage = rd.message;
        } else if (rd.errors) {
          throw rd;
        }
      }
    }
  } else if (err?.request) {
    errorMessage = "No response from server";
  }

  throw new Error(errorMessage);
};

export const login = async (email: string, password: string) => {
  try {
    const payload = { email, password };
    const response = await api.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
}) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

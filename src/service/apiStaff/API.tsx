// Staff-specific API functions
import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiWithoutCredentials = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
    request: err?.request,
  });
};

export const login = async (email: string, password: string) => {
  try {
    const payload = { email, password };
    const response = await apiWithoutCredentials.post("/auth/login", payload);
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
    const response = await apiWithoutCredentials.post(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

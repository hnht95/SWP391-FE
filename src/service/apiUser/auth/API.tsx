// src/services/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";
// import api from "../Utils";

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

export const forgotPassword = async (email: string) => {
  try {
    const payload = { email };
    const response = await api.post(
      "/users/forgot-password-email-otp",
      payload
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  try {
    const response = await api.get("admin/users", { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    const payload = { email, code, newPassword };
    const response = await api.post("/users/reset-password-email-otp", payload);

    return response.data;
  } catch (error) {
    handleError(error);
  }
};
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/me", {
      params: {
        populate: ["avatarUrl", "station"],
      },
    });

    return response.data;
  } catch (error) {
    handleError(error);
  }
};

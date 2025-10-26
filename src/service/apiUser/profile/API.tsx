import { AxiosError } from "axios";
import api from "../../Utils";

export type UserProfile = {
  id: string;
  role: "renter" | "staff" | "admin";
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  isActive: boolean;
  station: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetUserResponse = {
  ok: boolean;
  user: UserProfile;
};

export type UpdateUserResponse = {
  ok: boolean;
  user: UserProfile;
  message?: string;
};

const handleError = (error: unknown, context: string) => {
  const err = error as AxiosError;
  console.error(`Profile API Error [${context}]:`, {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
  });

  let errorMessage = err?.message || "Unknown error";
  if (err?.response?.data) {
    const responseData: any = err.response.data;
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  }

  throw new Error(errorMessage);
};

/**
 * GET /api/auth/me
 * Get current logged-in user profile
 * Response: { ok: true, user: UserProfile }
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<GetUserResponse>("/auth/me");

    console.log("✅ Get current user:", response.data);

    if (response.data.ok && response.data.user) {
      return response.data.user;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    handleError(error, "getCurrentUser");
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: FormData | Record<string, any>
): Promise<UserProfile> => {
  try {
    console.log("Updating user profile:", userId);

    const isFormData = data instanceof FormData;

    const response = await api.patch<UpdateUserResponse>(
      `/auth/${userId}`,
      data,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );

    console.log("✅ Update profile response:", response.data);

    if (response.data.ok && response.data.user) {
      return response.data.user;
    }

    throw new Error(response.data.message || "Failed to update profile");
  } catch (error) {
    handleError(error, "updateUserProfile");
    throw error;
  }
};

export const getRoleLabel = (role: UserProfile["role"]): string => {
  const roleLabels: Record<UserProfile["role"], string> = {
    renter: "Renter",
    staff: "Staff",
    admin: "Admin",
  };
  return roleLabels[role] || "User";
};

const profileApi = {
  getCurrentUser,
  updateUserProfile,
  getRoleLabel,
};

export default profileApi;

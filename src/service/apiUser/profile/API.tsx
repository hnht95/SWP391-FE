// service/apiUser/profile/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";

export type UserProfile = {
  _id?: string;
  id?: string;
  role: "renter" | "staff" | "admin";
  name: string;
  email: string;
  phone: string;
  gender?: "male" | "female";
  isActive?: boolean;
  station?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Response types
export type GetUserResponse = {
  success: boolean;
  data?: UserProfile;
  user?: UserProfile;
  ok?: boolean;
};

export type UpdateUserResponse = {
  success: boolean;
  ok?: boolean;
  user?: UserProfile;
  data?: UserProfile;
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
 * GET /api/users/me
 * Get current logged-in user profile
 * Response formats:
 * - { success: true, data: UserProfile }
 * - { ok: true, user: UserProfile }
 * - UserProfile (direct)
 */
export const getCurrentUser = async (): Promise<GetUserResponse> => {
  try {
    const response = await api.get("/users/me");

    console.log("✅ Get current user response:", response.data);

    // ✅ Case 1: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    // ✅ Case 2: { ok: true, user: {...} }
    if (response.data.ok && response.data.user) {
      return {
        success: true,
        data: response.data.user,
      };
    }

    // ✅ Case 3: Direct user object
    if (response.data._id || response.data.id) {
      return {
        success: true,
        data: response.data,
      };
    }

    throw new Error("Invalid response format");
  } catch (error) {
    handleError(error, "getCurrentUser");
    throw error;
  }
};

/**
 * PATCH /api/auth/{userId}
 * Update user profile
 */
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

    // Handle different response formats
    const userData = response.data.user || response.data.data || response.data;

    if (userData && (userData._id || userData.id)) {
      return userData as UserProfile;
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

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
  station?: string | null;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  defaultRefundWallet?: string | null;
  // ✅ Added KYC nested object
  kyc?: {
    verified: boolean;
    idFrontImage?: string | null;
    idBackImage?: string | null;
    licenseFrontImage?: string | null;
    licenseBackImage?: string | null;
    verifiedAt?: string | null;
  };
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
 * PATCH /api/users/me
 * Update user profile (name, phone, gender, avatar)
 * Supports both JSON and FormData (for file uploads)
 */
export const updateUserProfile = async (
  data: FormData | Partial<UserProfile>
): Promise<UpdateUserResponse> => {
  try {
    console.log("Updating user profile");

    const isFormData = data instanceof FormData;

    const response = await api.patch<UpdateUserResponse>(
      `/users/me`,
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

    return response.data;
  } catch (error) {
    handleError(error, "updateUserProfile");
    throw error;
  }
};

/**
 * ✅ NEW: PATCH /api/users/me
 * Upload KYC documents (ID card, license, etc.)
 * Requires FormData with multiple image files
 */
export const uploadKYCDocuments = async (documents: {
  idFrontImage?: File;
  idBackImage?: File;
  licenseFrontImage?: File;
  licenseBackImage?: File;
}): Promise<UpdateUserResponse> => {
  try {
    console.log("Uploading KYC documents");

    const formData = new FormData();

    // ✅ Append KYC documents based on API spec
    if (documents.idFrontImage) {
      formData.append("kyc.idFrontImage", documents.idFrontImage);
    }
    if (documents.idBackImage) {
      formData.append("kyc.idBackImage", documents.idBackImage);
    }
    if (documents.licenseFrontImage) {
      formData.append("kyc.licenseFrontImage", documents.licenseFrontImage);
    }
    if (documents.licenseBackImage) {
      formData.append("kyc.licenseBackImage", documents.licenseBackImage);
    }

    const response = await api.patch<UpdateUserResponse>(
      `/users/me`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ KYC upload response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "uploadKYCDocuments");
    throw error;
  }
};

/**
 * ✅ Helper: Upload single avatar image
 */
export const uploadAvatar = async (file: File): Promise<UpdateUserResponse> => {
  try {
    console.log("Uploading avatar");

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.patch<UpdateUserResponse>(
      `/users/me`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ Avatar upload response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "uploadAvatar");
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
  uploadKYCDocuments, // ✅ New
  uploadAvatar, // ✅ New
  getRoleLabel,
};

export default profileApi;

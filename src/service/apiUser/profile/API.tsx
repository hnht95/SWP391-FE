// service/apiUser/profile/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";

// ✅ Bank Info Type
export type BankInfo = {
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  bankName?: string;
  updatedAt?: string;
};

export type UserProfile = {
  _id?: string;
  id?: string;
  role: "renter" | "staff" | "admin" | "partner";
  name: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other";
  isActive?: boolean;
  station?: string | null;

  dateOfBirth?: string;
  avatarUrl?: string | { url: string } | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  defaultRefundWallet?: string | null;

  // ✅ KYC Info
  kyc?: {
    verified: boolean;
    idNumber?: string | null;
    licenseNumber?: string | null;
    idFrontImage?: { url: string } | string | null;
    idBackImage?: { url: string } | string | null;
    licenseFrontImage?: { url: string } | string | null;
    licenseBackImage?: { url: string } | string | null;
    verifiedAt?: string | null;
  };

  // ✅ Bank Info
  bankInfo?: BankInfo | null;
};

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

// Normalize server user payload into a consistent shape the UI can safely use
const normalizeUser = (raw: any | undefined | null): UserProfile | undefined => {
  if (!raw) return undefined;
  const avatarUrlField = raw.avatarUrl;
  const normalizedAvatarUrl: string | { url: string } | null =
    typeof avatarUrlField === "object" && avatarUrlField?.url
      ? { url: avatarUrlField.url }
      : typeof avatarUrlField === "string"
      ? raw.avatarUrl
      : null;

  const avatarString: string | undefined =
    normalizedAvatarUrl && typeof normalizedAvatarUrl === "object"
      ? normalizedAvatarUrl.url
      : typeof normalizedAvatarUrl === "string"
      ? normalizedAvatarUrl
      : raw.avatar || undefined;

  return {
    ...raw,
    avatarUrl: normalizedAvatarUrl,
    avatar: avatarString,
  } as UserProfile;
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
 */
export const getCurrentUser = async (): Promise<GetUserResponse> => {
  try {
    const response = await api.get("/users/me");
    console.log("✅ Get current user response:", response.data);

    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: normalizeUser(response.data.data),
      };
    }

    if (response.data.ok && response.data.user) {
      return {
        success: true,
        data: normalizeUser(response.data.user),
      };
    }

    if (response.data._id || response.data.id) {
      return {
        success: true,
        data: normalizeUser(response.data),
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
 * Update basic profile info (name, phone, gender, dateOfBirth, addresses)
 */
export const updateUserProfile = async (data: {
  name?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
}): Promise<UpdateUserResponse> => {
  try {
    console.log("Updating user profile (basic info):", data);
    const response = await api.patch<UpdateUserResponse>(`/users/me`, data);
    // Some backends omit unchanged fields or set them to null in PATCH response.
    // Normalize the shape so UI never loses the avatar locally.
    const normalized = {
      ...response.data,
      data: normalizeUser(response.data?.data ?? response.data?.user),
      user: normalizeUser(response.data?.user ?? response.data?.data),
    } as UpdateUserResponse;
    console.log("✅ Update profile response (normalized):", normalized);
    return normalized;
  } catch (error) {
    handleError(error, "updateUserProfile");
    throw error;
  }
};

/**
 * ✅ PATCH /api/users/me
 * Update bank information for refund purposes
 */
export const updateBankInfo = async (bankInfo: {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName?: string;
}): Promise<UpdateUserResponse> => {
  try {
    console.log("Updating bank info:", bankInfo);

    const response = await api.patch<UpdateUserResponse>(`/users/me`, {
      "bankInfo.accountNumber": bankInfo.accountNumber,
      "bankInfo.accountName": bankInfo.accountName,
      "bankInfo.bankCode": bankInfo.bankCode,
      "bankInfo.bankName": bankInfo.bankName,
    });

    console.log("✅ Bank info update response:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "updateBankInfo");
    throw error;
  }
};

/**
 * ✅ PATCH /api/users/me
 * Upload KYC documents with ID/License numbers
 */
export const uploadKYCDocuments = async (documents: {
  idNumber?: string;
  licenseNumber?: string;
  idFrontImage?: File;
  idBackImage?: File;
  licenseFrontImage?: File;
  licenseBackImage?: File;
}): Promise<UpdateUserResponse> => {
  try {
    console.log("Uploading KYC documents with numbers");

    const formData = new FormData();

    // ✅ Append text fields
    if (documents.idNumber) {
      formData.append("kyc.idNumber", documents.idNumber);
    }
    if (documents.licenseNumber) {
      formData.append("kyc.licenseNumber", documents.licenseNumber);
    }

    // ✅ Append image files
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
    return {
      ...response.data,
      data: normalizeUser(response.data?.data ?? response.data?.user),
      user: normalizeUser(response.data?.user ?? response.data?.data),
    } as UpdateUserResponse;
  } catch (error) {
    handleError(error, "uploadKYCDocuments");
    throw error;
  }
};

/**
 * PATCH /api/users/me
 * Upload avatar image ONLY
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
    return {
      ...response.data,
      data: normalizeUser(response.data?.data ?? response.data?.user),
      user: normalizeUser(response.data?.user ?? response.data?.data),
    } as UpdateUserResponse;
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
    partner: "Partner",
  };
  return roleLabels[role] || "User";
};

/**
 * ✅ Get list of Vietnamese banks
 */
export const getVietnameseBanks = (): Array<{ code: string; name: string }> => {
  return [
    { code: "VCB", name: "Vietcombank" },
    { code: "TCB", name: "Techcombank" },
    { code: "VTB", name: "Vietinbank" },
    { code: "BIDV", name: "BIDV" },
    { code: "ACB", name: "ACB" },
    { code: "MB", name: "MBBank" },
    { code: "VPB", name: "VPBank" },
    { code: "TPB", name: "TPBank" },
    { code: "STB", name: "Sacombank" },
    { code: "SHB", name: "SinHanBbank" },
    { code: "MSB", name: "MSBank" },
    { code: "OCB", name: "OCBbank" },
    { code: "EIB", name: "Eximbank" },
    { code: "HDB", name: "HDBank" },
    { code: "VAB", name: "VietABank" },
    { code: "NAB", name: "NamABank" },
    { code: "PGB", name: "PGBank" },
    { code: "SEAB", name: "SeABank" },
    { code: "VIB", name: "VIB" },
    { code: "ABB", name: "ABBANK" },
  ].sort((a, b) => a.name.localeCompare(b.name));
};

const profileApi = {
  getCurrentUser,
  updateUserProfile,
  updateBankInfo, // ✅ New
  uploadKYCDocuments,
  uploadAvatar,
  getRoleLabel,
  getVietnameseBanks, // ✅ New
};

export default profileApi;

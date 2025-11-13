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
const normalizeUser = (
  raw: any | undefined | null
): UserProfile | undefined => {
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

// ========== Refund & Cancelled Paid Types ==========
export type CancelledPaidItem = {
  bookingId: string;
  status: "cancelled";
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    _id: string;
    plateNumber: string;
    brand: string;
    model: string;
    pricePerDay?: number;
    pricePerHour?: number;
    status?: string;
    defaultPhotos?: {
      exterior?: string[] | Array<{ _id?: string; url?: string }>;
      interior?: string[] | Array<{ _id?: string; url?: string }>;
    };
  };
  station: {
    _id: string;
    name: string;
    location: { address: string; lat: number; lng: number };
  };
  deposit: {
    status: "refunded" | "pending" | "captured" | "failed" | "none";
    amount: number;
    currency: string;
    provider: string;
  };
  amounts: {
    totalPaid?: number;
    rentalEstimated?: number;
    rentalActual?: number;
  };
  paid?: number;
  cancellationReason?: string;
};

export type Paginated<T> = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
};

export type ManualRefundItem = {
  id: string;
  booking: {
    bookingId: string;
    status:
      | "cancelled"
      | "completed"
      | "reserved"
      | "active"
      | "expired"
      | "returning";
    startTime: string;
    endTime: string;
    depositStatus: "refunded" | "pending" | "captured" | "failed" | "none";
    totalPaid: number;
  };
  amount: number;
  currency: string;
  method: "bank_transfer" | "cash" | "card" | string;
  status: "done" | "pending" | "failed";
  reference: string | null;
  transferredAt: string;
  beneficiary: {
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  note?: string;
  staff?: { _id: string; name: string; email?: string };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
};
const normPhotoArray = (arr: unknown): Array<{ _id?: string; url: string }> => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => {
      if (typeof x === "string") return { url: x };
      if (x && typeof x === "object") {
        const o = x as { _id?: string; url?: string };
        return { _id: o._id, url: o.url || "" };
      }
      return { url: "" };
    })
    .filter((x) => x.url);
};

const normalizeCancelledPaid = (raw: any): CancelledPaidItem => {
  return {
    bookingId: String(raw?.bookingId || ""),
    status: "cancelled",
    startTime: String(raw?.startTime || ""),
    endTime: String(raw?.endTime || ""),
    createdAt: String(raw?.createdAt || ""),
    updatedAt: String(raw?.updatedAt || ""),
    vehicle: {
      _id: String(raw?.vehicle?._id || ""),
      plateNumber: String(raw?.vehicle?.plateNumber || ""),
      brand: String(raw?.vehicle?.brand || ""),
      model: String(raw?.vehicle?.model || ""),
      pricePerDay: Number(raw?.vehicle?.pricePerDay || 0),
      pricePerHour: Number(raw?.vehicle?.pricePerHour || 0),
      status: String(raw?.vehicle?.status || ""),
      defaultPhotos: {
        exterior: normPhotoArray(raw?.vehicle?.defaultPhotos?.exterior),
        interior: normPhotoArray(raw?.vehicle?.defaultPhotos?.interior),
      },
    },
    station: {
      _id: String(raw?.station?._id || ""),
      name: String(raw?.station?.name || ""),
      location: {
        address: String(raw?.station?.location?.address || ""),
        lat: Number(raw?.station?.location?.lat || 0),
        lng: Number(raw?.station?.location?.lng || 0),
      },
    },
    deposit: {
      status: (raw?.deposit?.status ||
        "none") as CancelledPaidItem["deposit"]["status"],
      amount: Number(raw?.deposit?.amount || 0),
      currency: String(raw?.deposit?.currency || "VND"),
      provider: String(raw?.deposit?.provider || "payos"),
    },
    amounts: {
      totalPaid: Number(raw?.amounts?.totalPaid || 0),
      rentalEstimated: Number(raw?.amounts?.rentalEstimated || 0),
      rentalActual: Number(raw?.amounts?.rentalActual || 0),
    },
    paid: Number(raw?.paid || 0),
    cancellationReason: raw?.cancellationReason
      ? String(raw?.cancellationReason)
      : undefined,
  };
};

const normalizeManualRefund = (raw: any): ManualRefundItem => {
  return {
    id: String(raw?.id || raw?._id || ""),
    booking: {
      bookingId: String(raw?.booking?.bookingId || ""),
      status: String(raw?.booking?.status || "cancelled"),
      startTime: String(raw?.booking?.startTime || ""),
      endTime: String(raw?.booking?.endTime || ""),
      depositStatus: String(raw?.booking?.depositStatus || "refunded"),
      totalPaid: Number(raw?.booking?.totalPaid || 0),
    },
    amount: Number(raw?.amount || 0),
    currency: String(raw?.currency || "VND"),
    method: String(raw?.method || "bank_transfer"),
    status: String(raw?.status || "done"),
    reference: raw?.reference ?? null,
    transferredAt: String(raw?.transferredAt || ""),
    beneficiary: {
      bankCode: raw?.beneficiary?.bankCode || undefined,
      bankName: raw?.beneficiary?.bankName || undefined,
      accountNumber: raw?.beneficiary?.accountNumber || undefined,
      accountName: raw?.beneficiary?.accountName || undefined,
    },
    note: raw?.note ? String(raw?.note) : "",
    staff: raw?.staff?._id
      ? {
          _id: String(raw?.staff?._id),
          name: String(raw?.staff?.name || ""),
          email: raw?.staff?.email ? String(raw?.staff?.email) : undefined,
        }
      : undefined,
    attachments: Array.isArray(raw?.attachments)
      ? raw.attachments.map((u: any) => String(u))
      : [],
    createdAt: String(raw?.createdAt || ""),
    updatedAt: String(raw?.updatedAt || ""),
  };
};
/**
 * GET /api/bookings/me/cancelled-paid
 * Danh sách booking đã hủy nhưng đã thanh toán (và đã refund)
 */
export const getMyCancelledPaidBookings = async (
  params: { page?: number; limit?: number } = {}
): Promise<Paginated<CancelledPaidItem>> => {
  try {
    const { page = 1, limit = 20 } = params;
    const res = await api.get("/bookings/me/cancelled-paid", {
      params: { page, limit },
    });
    const data = res.data || {};
    const itemsRaw = Array.isArray(data.items) ? data.items : [];
    const items = itemsRaw.map(normalizeCancelledPaid);
    return {
      page: Number(data.page || page),
      limit: Number(data.limit || limit),
      total: Number(data.total || items.length),
      totalPages: Number(data.totalPages || 1),
      items,
    };
  } catch (error) {
    handleError(error, "getMyCancelledPaidBookings");
    throw error;
  }
};

/**
 * GET /api/manual-refunds/me/manual-done
 * Danh sách refund thủ công đã hoàn tất của user
 */
export const getMyManualRefundsDone = async (
  params: { page?: number; limit?: number } = {}
): Promise<Paginated<ManualRefundItem>> => {
  try {
    const { page = 1, limit = 20 } = params;
    const res = await api.get("/manual-refunds/me/manual-done", {
      params: { page, limit },
    });
    const data = res.data || {};
    const itemsRaw = Array.isArray(data.items) ? data.items : [];
    const items = itemsRaw.map(normalizeManualRefund);
    return {
      page: Number(data.page || page),
      limit: Number(data.limit || limit),
      total: Number(data.total || items.length),
      totalPages: Number(data.totalPages || 1),
      items,
    };
  } catch (error) {
    handleError(error, "getMyManualRefundsDone");
    throw error;
  }
};

const profileApi = {
  getCurrentUser,
  updateUserProfile,
  updateBankInfo, // ✅ New
  uploadKYCDocuments,
  uploadAvatar,
  getRoleLabel,
  getVietnameseBanks,
  getMyCancelledPaidBookings, // ✅ new
  getMyManualRefundsDone, // ✅ New
};

export default profileApi;

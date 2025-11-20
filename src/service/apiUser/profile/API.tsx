// service/apiUser/profile/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";

// ========== Types ==========

export type BankInfo = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName?: string;
  updatedAt?: string;
};

export type UserProfile = {
  _id: string;
  id?: string;
  role: "renter" | "staff" | "admin" | "partner";
  name: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other";
  isActive?: boolean;
  station?: string | null;
  dateOfBirth?: string;
  avatarUrl?: string | { _id?: string; url: string } | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  defaultRefundWallet?: string | null;

  kyc?: {
    verified: boolean;
    idNumber?: string;
    licenseNumber?: string;
    idFrontImage?: { _id?: string; url: string } | null;
    idBackImage?: { _id?: string; url: string } | null;
    licenseFrontImage?: { _id?: string; url: string } | null;
    licenseBackImage?: { _id?: string; url: string } | null;
    verifiedAt?: string;
  } | null;

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

export type CancelledPaidItem = {
  bookingId: string;
  status: "cancelled";
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    _id: string;
    id?: string;
    image?: string;
    plateNumber: string;
    brand: string;
    model: string;
    pricePerDay?: number;
    pricePerHour?: number;
    status?: string;
    defaultPhotos?: {
      exterior?: Array<{ _id?: string; url: string }>;
      interior?: Array<{ _id?: string; url: string }>;
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

// ========== Helper Functions ==========

const normalizeUser = (
  raw: Record<string, unknown> | undefined | null
): UserProfile | undefined => {
  if (!raw) return undefined;

  const avatarUrlField = raw.avatarUrl;
  const normalizedAvatarUrl: string | { _id?: string; url: string } | null =
    (() => {
      if (
        typeof avatarUrlField === "object" &&
        avatarUrlField !== null &&
        "url" in avatarUrlField
      ) {
        const obj = avatarUrlField as { _id?: string; url: string };
        return { _id: obj._id, url: obj.url };
      }
      if (typeof avatarUrlField === "string") {
        return avatarUrlField;
      }
      return null;
    })();

  const avatarString: string | undefined =
    normalizedAvatarUrl && typeof normalizedAvatarUrl === "object"
      ? normalizedAvatarUrl.url
      : typeof normalizedAvatarUrl === "string"
      ? normalizedAvatarUrl
      : (raw.avatar as string | undefined) || undefined;

  return {
    ...raw,
    avatarUrl: normalizedAvatarUrl,
    avatar: avatarString,
  } as UserProfile;
};

const handleError = (err: unknown, context: string): never => {
  const axiosError = err as AxiosError;
  console.error(`Profile API Error [${context}]:`, {
    status: axiosError?.response?.status,
    data: axiosError?.response?.data,
    message: axiosError?.message,
  });

  let errorMessage = axiosError?.message || "Unknown error";
  if (axiosError?.response?.data) {
    const responseData = axiosError.response.data as Record<string, unknown>;
    if (typeof responseData.message === "string") {
      errorMessage = responseData.message;
    } else if (typeof responseData.error === "string") {
      errorMessage = responseData.error;
    }
  }

  throw new Error(errorMessage);
};

const normPhotoArray = (arr: unknown): Array<{ _id?: string; url: string }> => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x: unknown) => {
      if (typeof x === "string") return { url: x };
      if (x && typeof x === "object") {
        const o = x as { _id?: string; url?: string };
        return { _id: o._id, url: o.url || "" };
      }
      return { url: "" };
    })
    .filter((x) => x.url);
};

const extractUrlFromMarkdown = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") return undefined;
  const md = /\((https?:\/\/[^\s)]+)\)/.exec(raw);
  if (md?.[1]) return md[1];
  if (/^https?:\/\//i.test(raw)) return raw;
  return undefined;
};

const normalizeCancelledPaid = (
  raw: Record<string, unknown>
): CancelledPaidItem => {
  const vehicle = raw?.vehicle as Record<string, unknown> | undefined;
  const station = raw?.station as Record<string, unknown> | undefined;
  const stationLocation = station?.location as
    | Record<string, unknown>
    | undefined;
  const deposit = raw?.deposit as Record<string, unknown> | undefined;
  const amounts = raw?.amounts as Record<string, unknown> | undefined;
  const defaultPhotos = vehicle?.defaultPhotos as
    | Record<string, unknown>
    | undefined;

  return {
    bookingId: String(raw?.bookingId || ""),
    status: "cancelled",
    startTime: String(raw?.startTime || ""),
    endTime: String(raw?.endTime || ""),
    createdAt: String(raw?.createdAt || ""),
    updatedAt: String(raw?.updatedAt || ""),
    vehicle: {
      _id: String(vehicle?._id || vehicle?.id || ""),
      id: vehicle?.id ? String(vehicle.id) : undefined,
      image: extractUrlFromMarkdown(vehicle?.image),
      plateNumber: String(vehicle?.plateNumber || ""),
      brand: String(vehicle?.brand || ""),
      model: String(vehicle?.model || ""),
      pricePerDay: Number(vehicle?.pricePerDay || 0),
      pricePerHour: Number(vehicle?.pricePerHour || 0),
      status: String(vehicle?.status || ""),
      defaultPhotos: {
        exterior: normPhotoArray(defaultPhotos?.exterior),
        interior: normPhotoArray(defaultPhotos?.interior),
      },
    },
    station: {
      _id: String(station?._id || ""),
      name: String(station?.name || ""),
      location: {
        address: String(stationLocation?.address || ""),
        lat: Number(stationLocation?.lat || 0),
        lng: Number(stationLocation?.lng || 0),
      },
    },
    deposit: {
      status: (deposit?.status ||
        "none") as CancelledPaidItem["deposit"]["status"],
      amount: Number(deposit?.amount || 0),
      currency: String(deposit?.currency || "VND"),
      provider: String(deposit?.provider || "payos"),
    },
    amounts: {
      totalPaid: Number(amounts?.totalPaid || 0),
      rentalEstimated: Number(amounts?.rentalEstimated || 0),
      rentalActual: Number(amounts?.rentalActual || 0),
    },
    paid: Number(raw?.paid || 0),
    cancellationReason: raw?.cancellationReason
      ? String(raw.cancellationReason)
      : undefined,
  };
};

const normalizeManualRefund = (
  raw: Record<string, unknown>
): ManualRefundItem => {
  const booking = raw?.booking as Record<string, unknown> | undefined;
  const beneficiary = raw?.beneficiary as Record<string, unknown> | undefined;
  const staff = raw?.staff as Record<string, unknown> | undefined;

  return {
    id: String(raw?.id || raw?._id || ""),
    booking: {
      bookingId: String(booking?.bookingId || ""),
      status: String(
        booking?.status || "cancelled"
      ) as ManualRefundItem["booking"]["status"],
      startTime: String(booking?.startTime || ""),
      endTime: String(booking?.endTime || ""),
      depositStatus: String(
        booking?.depositStatus || "refunded"
      ) as ManualRefundItem["booking"]["depositStatus"],
      totalPaid: Number(booking?.totalPaid || 0),
    },
    amount: Number(raw?.amount || 0),
    currency: String(raw?.currency || "VND"),
    method: String(raw?.method || "bank_transfer"),
    status: String(raw?.status || "done") as ManualRefundItem["status"],
    reference: raw?.reference ? String(raw.reference) : null,
    transferredAt: String(raw?.transferredAt || ""),
    beneficiary: {
      bankCode: beneficiary?.bankCode
        ? String(beneficiary.bankCode)
        : undefined,
      bankName: beneficiary?.bankName
        ? String(beneficiary.bankName)
        : undefined,
      accountNumber: beneficiary?.accountNumber
        ? String(beneficiary.accountNumber)
        : undefined,
      accountName: beneficiary?.accountName
        ? String(beneficiary.accountName)
        : undefined,
    },
    note: raw?.note ? String(raw.note) : "",
    staff: staff?._id
      ? {
          _id: String(staff._id),
          name: String(staff.name || ""),
          email: staff.email ? String(staff.email) : undefined,
        }
      : undefined,
    attachments: Array.isArray(raw?.attachments)
      ? (raw.attachments as unknown[]).map((u) => String(u))
      : [],
    createdAt: String(raw?.createdAt || ""),
    updatedAt: String(raw?.updatedAt || ""),
  };
};

// ========== API Functions ==========

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
  } catch (err) {
    handleError(err, "getCurrentUser");
    throw err;
  }
};

export const updateUserProfile = async (data: {
  name?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
}): Promise<UpdateUserResponse> => {
  try {
    console.log("Updating user profile (basic info):", data);
    const response = await api.patch<UpdateUserResponse>(`/users/me`, data);

    const normalized = {
      ...response.data,
      data: normalizeUser(response.data?.data ?? response.data?.user),
      user: normalizeUser(response.data?.user ?? response.data?.data),
    } as UpdateUserResponse;

    console.log("✅ Update profile response (normalized):", normalized);
    return normalized;
  } catch (err) {
    handleError(err, "updateUserProfile");
    throw err;
  }
};

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
  } catch (err) {
    handleError(err, "updateBankInfo");
    throw err;
  }
};

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

    if (documents.idNumber) {
      formData.append("kyc.idNumber", documents.idNumber);
    }
    if (documents.licenseNumber) {
      formData.append("kyc.licenseNumber", documents.licenseNumber);
    }
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
  } catch (err) {
    handleError(err, "uploadKYCDocuments");
    throw err;
  }
};

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
  } catch (err) {
    handleError(err, "uploadAvatar");
    throw err;
  }
};

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
  } catch (err) {
    handleError(err, "getMyCancelledPaidBookings");
    throw err;
  }
};

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
  } catch (err) {
    handleError(err, "getMyManualRefundsDone");
    throw err;
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
  updateBankInfo,
  uploadKYCDocuments,
  uploadAvatar,
  getRoleLabel,
  getVietnameseBanks,
  getMyCancelledPaidBookings,
  getMyManualRefundsDone,
};

export default profileApi;

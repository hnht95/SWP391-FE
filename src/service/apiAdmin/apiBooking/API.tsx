import axios from "axios";
import api from "../../Utils";

// ============ TYPE DEFINITIONS ============

export type BookingStatus =
  | "pending"
  | "reserved"
  | "active"
  | "returning"
  | "completed"
  | "cancelled"
  | "expired";

export type DepositStatus =
  | "none"
  | "pending"
  | "captured"
  | "failed"
  | "refunded";

export type Renter = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  id?: string;
};

export type VehicleInBooking = {
  _id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  pricePerDay: number;
  pricePerHour: number;
  status: string;
  defaultPhotos?: {
    exterior: Array<{ _id: string; url: string; type: string }>;
    interior: Array<{ _id: string; url: string; type: string }>;
  };
};

export type StationInfo = {
  _id: string;
  name: string;
  code?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
};

export type PayOSLastWebhook = {
  code: string;
  desc: string;
  success: boolean;
  data: Record<string, unknown>;
  signature: string;
};

export type DepositInfo = {
  amount: number;
  currency: string;
  provider: string;
  providerRef: string | null;
  status: DepositStatus;
  payos?: {
    orderCode: number;
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
    amountCaptured?: number;
    paidAt?: string;
    lastWebhook?: PayOSLastWebhook;
  };
};

export type PricingSnapshot = {
  baseUnit: "hour" | "day";
  basePrice: number;
  computedQty?: number;
};

export type BookingAmounts = {
  rentalEstimated?: number;
  overKmFee: number;
  lateFee: number;
  batteryFee: number;
  damageCharge: number;
  discounts: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  totalPaid: number;
};

export type CancellationPolicy = {
  windows: Array<Record<string, unknown>>;
  specialCases: Array<Record<string, unknown>>;
};

export type Booking = {
  _id: string;
  bookingId?: string;
  renter: string | Renter;
  vehicle: string | VehicleInBooking;
  station: string | StationInfo;
  company: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  deposit: DepositInfo;
  holdExpiresAt: string | null;
  checkoutUrl?: string;
  qrCode?: string;
  counterCheck: {
    licenseSnapshot: string[];
    contractPhotos: string[];
  };
  handoverPhotos: {
    exteriorBefore: string[];
    interiorBefore: string[];
    exteriorAfter: string[];
    interiorAfter: string[];
  };
  cancellationPolicySnapshot: CancellationPolicy;
  amounts: BookingAmounts;
  amountEstimated?: number;
  pricingSnapshot?: PricingSnapshot;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PaginatedBookingsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Booking[];
};

export type BookingQueryParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type ApiResponseWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type AdminTransactionStatus =
  | "none"
  | "pending"
  | "captured"
  | "failed"
  | "refunded";

export type AdminTransactionItem = {
  _id: string;
  renter: string;
  vehicle: string | null;
  station: string | null;
  company: string | null;
  status: BookingStatus;
  deposit: {
    amount: number;
    currency: string;
    providerRef: string | null;
    status: AdminTransactionStatus;
    payos?: {
      orderCode: number;
      paymentLinkId: string;
      checkoutUrl: string;
      qrCode: string;
      paidAt?: string;
    };
  };
  amounts: { totalPaid: number };
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  _dateSort?: string;
  renterInfo?: { _id: string; name: string; email: string; phone: string };
  vehicleInfo?: null | {
    _id: string;
    plateNumber: string;
    brand: string;
    model: string;
  };
  stationInfo?: null | { _id: string; name: string };
  companyInfo?: null | { _id: string; name: string };
};

export type AdminTransactionsResponse = {
  page: number;
  limit: number;
  total: number;
  items: AdminTransactionItem[];
};

export type DamageReportStatus = "reported" | "charged" | "rejected";

export type DamageReportPhoto = {
  _id: string;
  url: string;
  publicId: string;
  type: string;
  provider: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type DamageReportBooking = {
  _id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
};

export type DamageReportVehicle = {
  _id: string;
  plateNumber: string;
  brand: string;
  model: string;
} | null;

export type DamageReportUser = {
  _id: string;
  name: string;
  email: string;
};

export type AdminAssessment = {
  chargeAmount: number;
  admin?: {
    _id: string;
    name: string;
    email: string;
  };
  decisionAt?: string;
  note?: string;
};

export type DamageReport = {
  _id: string;
  booking: DamageReportBooking;
  vehicle: DamageReportVehicle;
  reportedBy: DamageReportUser;
  description: string;
  photos: DamageReportPhoto[];
  status: DamageReportStatus;
  adminAssessment?: AdminAssessment;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PaginatedDamageReportsResponse = {
  success: boolean;
  message?: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    items: DamageReport[];
  };
};

export type ApproveDamageReportRequest = {
  chargeAmount: number;
  note?: string;
};

export type ApproveDamageReportResponse = {
  success: boolean;
  message: string;
  data?: DamageReport;
};

export type RejectDamageReportResponse = {
  success: boolean;
  message: string;
  data?: DamageReport;
};

// ============ ERROR HANDLER ============

const handleError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    console.error(`Booking API Error [${context}]:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    let errorMessage = error.message || "Unknown error";

    if (error.response?.data) {
      const responseData = error.response.data as ApiResponseWrapper<unknown>;
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      }
    }

    throw new Error(errorMessage);
  } else {
    console.error(`Booking API Error [${context}]:`, error);
    throw new Error("An unexpected error occurred");
  }
};

// ============ HELPER FUNCTIONS FOR NORMALIZATION ============

// ============ API FUNCTIONS ============


export const getAdminTransactions = async (
  params: {
    provider?: string;
    status?: AdminTransactionStatus | "--";
    renterPhone?: string;
    plateNumber?: string;
    search?: string;
    from?: string;
    to?: string;
    dateField?: "createdAt" | "updatedAt";
    page?: number;
    limit?: number;
  } = {}
): Promise<AdminTransactionsResponse> => {
  try {
    const {
      provider,
      status,
      renterPhone,
      plateNumber,
      search,
      from,
      to,
      dateField,
      page = 1,
      limit = 20,
    } = params;

    const response = await api.get<AdminTransactionsResponse>(
      "/bookings/admin/transactions",
      {
        params: {
          page,
          limit,
          ...(provider && { provider }),
          ...(status && status !== "--" && { status }),
          ...(renterPhone && { renterPhone }),
          ...(plateNumber && { plateNumber }),
          ...(search && { search }),
          ...(from && { from }),
          ...(to && { to }),
          ...(dateField && { dateField }),
        },
      }
    );

    return response.data;
  } catch (err) {
    handleError(err, "getAdminTransactions");
    throw err;
  }
};

export const getBookedVehicles = async (
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginatedBookingsResponse> => {
  try {
    const { page = 1, limit = 20 } = params;

    const response = await api.get<PaginatedBookingsResponse>(
      "/bookings/booked-vehicles",
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  } catch (err) {
    handleError(err, "getBookedVehicles");
    throw err;
  }
};

export const getAllDamageReports = async (
  params: {
    page?: number;
    limit?: number;
    status?: DamageReportStatus;
  } = {}
): Promise<PaginatedDamageReportsResponse> => {
  try {
    const { page = 1, limit = 20, status } = params;

    const response = await api.get<
      ApiResponseWrapper<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        items: DamageReport[];
      }>
    >("/damage-reports", {
      params: {
        page,
        limit,
        ...(status && { status }),
      },
    });

    const responseData = response.data.data || response.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "items" in responseData
    ) {
      return {
        success: response.data.success !== false,
        message: response.data.message,
        data: {
          page:
            typeof responseData.page === "number" ? responseData.page : page,
          limit:
            typeof responseData.limit === "number" ? responseData.limit : limit,
          total:
            typeof responseData.total === "number" ? responseData.total : 0,
          totalPages:
            typeof responseData.totalPages === "number"
              ? responseData.totalPages
              : 1,
          items: Array.isArray(responseData.items) ? responseData.items : [],
        },
      };
    }

    throw new Error("Invalid damage reports response format");
  } catch (err) {
    handleError(err, "getAllDamageReports");
    throw err;
  }
};

export const approveDamageReport = async (
  damageReportId: string,
  data: ApproveDamageReportRequest
): Promise<ApproveDamageReportResponse> => {
  try {
    console.log("🔄 Approving damage report:", damageReportId, data);

    const response = await api.post<ApproveDamageReportResponse>(
      `/damage-reports/${damageReportId}/approve`,
      data
    );

    console.log("✅ Approve damage report response:", response.data);

    return response.data;
  } catch (err) {
    handleError(err, "approveDamageReport");
    throw err;
  }
};

export const rejectDamageReport = async (
  damageReportId: string
): Promise<RejectDamageReportResponse> => {
  try {
    console.log("🔄 Rejecting damage report:", damageReportId);

    const response = await api.post<RejectDamageReportResponse>(
      `/damage-reports/${damageReportId}/reject`
    );

    console.log("✅ Reject damage report response:", response.data);

    return response.data;
  } catch (err) {
    handleError(err, "rejectDamageReport");
    throw err;
  }
};

export const getDamageReportById = async (
  damageReportId: string
): Promise<{ success: boolean; message?: string; data: DamageReport }> => {
  try {
    console.log("🔄 Fetching damage report by ID:", damageReportId);

    const response = await api.get<ApiResponseWrapper<DamageReport>>(
      `/damage-reports/${damageReportId}`
    );

    console.log("✅ Get damage report by ID response:", response.data);

    const responseData = response.data.data || response.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "_id" in responseData
    ) {
      return {
        success: response.data.success !== false,
        message: response.data.message,
        data: responseData as DamageReport,
      };
    }

    throw new Error("Invalid damage report response format");
  } catch (err) {
    handleError(err, "getDamageReportById");
    throw err;
  }
};

export const getDamageReportByBookingId = async (
  bookingId: string
): Promise<{
  success: boolean;
  message?: string;
  data: DamageReport | null;
}> => {
  try {
    console.log("🔄 Fetching damage report by booking ID:", bookingId);

    const response = await api.get<ApiResponseWrapper<DamageReport | null>>(
      `/damage-reports/booking/${bookingId}`
    );

    console.log("✅ Get damage report by booking ID response:", response.data);

    const responseData = response.data.data || response.data;

    if (responseData === null) {
      return {
        success: response.data.success !== false,
        message: response.data.message,
        data: null,
      };
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "_id" in responseData
    ) {
      return {
        success: response.data.success !== false,
        message: response.data.message,
        data: responseData as DamageReport,
      };
    }

    throw new Error("Invalid damage report response format");
  } catch (err) {
    handleError(err, "getDamageReportByBookingId");
    throw err;
  }
};

// ============ HELPER FUNCTIONS ============

export const getBookingStatusColor = (status: BookingStatus): string => {
  const statusColors: Record<BookingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reserved: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    returning: "bg-orange-100 text-orange-800",
    completed: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const getBookingStatusLabel = (status: BookingStatus): string => {
  const statusLabels: Record<BookingStatus, string> = {
    pending: "Pending",
    reserved: "Reserved",
    active: "Active",
    returning: "Returning",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
  };
  return statusLabels[status] || status;
};

export const getDepositStatusColor = (status: DepositStatus): string => {
  const statusColors: Record<DepositStatus, string> = {
    none: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    captured: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const formatCurrency = (
  amount: number,
  currency: string = "VND"
): string => {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
  return `${amount} ${currency}`;
};

export const isBookingExpired = (holdExpiresAt?: string | null): boolean => {
  if (!holdExpiresAt) return false;
  return new Date(holdExpiresAt) < new Date();
};

export const calculateDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// ============ EXPORT DEFAULT ============

const bookingApi = {
  getAdminTransactions,
  getBookedVehicles,
  getAllDamageReports,
  getDamageReportById,
  getDamageReportByBookingId,
  approveDamageReport,
  rejectDamageReport,
  getBookingStatusColor,
  getBookingStatusLabel,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateDuration,
  formatDate,
};

export default bookingApi;

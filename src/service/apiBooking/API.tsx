// service/apiBooking/API.tsx
import axios, { AxiosError } from "axios";
import api from "../Utils";

// ============ TYPE DEFINITIONS ============

export type BookingStatus =
  | "pending"
  | "reserved"
  | "active"
  | "completed"
  | "cancelled"
  | "expired"; // ✅ Added expired status

export type DepositStatus =
  | "none"
  | "pending"
  | "captured"
  | "failed"
  | "refunded";

// ✅ Renter info (populated)
export type Renter = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
};

// ✅ Vehicle info (populated)
export type VehicleInBooking = {
  _id: string;
  plateNumber: string;
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerHour: number;
  status: string;
  defaultPhotos: {
    exterior: string[];
    interior: string[];
  };
};

// ✅ Station info (populated)
export type StationInfo = {
  _id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
};

// ✅ Deposit info with PayOS details
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
    amountCaptured: number;
    paidAt?: string;
    lastWebhook?: {
      code: string;
      desc: string;
      success: boolean;
      data: any;
      signature: string;
    };
  };
};

// ✅ Pricing snapshot
export type PricingSnapshot = {
  baseUnit: "hour" | "day";
  basePrice: number;
  computedQty?: number;
};

// ✅ Booking amounts
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

// ✅ Main Booking interface (from /api/bookings/mine)
export type Booking = {
  _id: string;
  renter: string; // Just ID in response
  vehicle: VehicleInBooking;
  station: StationInfo;
  company: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  deposit: DepositInfo;
  holdExpiresAt: string | null;
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
  cancellationPolicySnapshot: {
    windows: any[];
    specialCases: any[];
  };
  amounts: BookingAmounts;
  pricingSnapshot?: PricingSnapshot;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// ✅ Create booking request
export type CreateBookingRequest = {
  vehicleId: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  deposit: {
    provider: "payos";
  };
};

// ✅ Paginated response (from /api/bookings/mine)
export type PaginatedBookingsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Booking[];
};

// ✅ Query params for bookings
export type BookingQueryParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: "startTime" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
};

// ============ ERROR HANDLER ============

const handleError = (error: unknown, context: string) => {
  // ✅ Use axios type guard
  if (axios.isAxiosError(error)) {
    console.error(`Booking API Error [${context}]:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    let errorMessage = error.message || "Unknown error";

    if (error.response?.data) {
      const responseData = error.response.data as any;
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

// ============ API FUNCTIONS ============

/**
 * POST /api/bookings
 * Create new booking with PayOS deposit
 */
export const createBooking = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  try {
    const response = await api.post<Booking>("/bookings", data);

    console.log("✅ Create booking response:", response.data);

    if (response.data && response.data._id) {
      return response.data;
    }

    throw new Error("Invalid booking response: missing _id");
  } catch (error) {
    handleError(error, "createBooking");
    throw error;
  }
};

/**
 * GET /api/bookings/mine
 * Get user's bookings with pagination and filters
 */
export const getMyBookings = async (
  params: BookingQueryParams = {}
): Promise<PaginatedBookingsResponse> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = params;

    console.log("Fetching user bookings with params:", params);

    const response = await api.get<PaginatedBookingsResponse>(
      "/bookings/mine",
      {
        params: {
          page,
          limit,
          ...(status && { status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }
    );

    console.log("✅ Get bookings response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "getMyBookings");
    throw error;
  }
};

/**
 * GET /api/bookings/{id}
 * Get booking details by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    console.log("Fetching booking:", bookingId);

    const response = await api.get<{ success: boolean; data: Booking }>(
      `/bookings/${bookingId}`
    );

    console.log("✅ Get booking response:", response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback: direct data
    if (response.data._id) {
      return response.data as any;
    }

    throw new Error("Booking not found");
  } catch (error) {
    handleError(error, "getBookingById");
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/payment/link
 * Create new payment link (when old link expired)
 */
export const createPaymentLink = async (
  bookingId: string
): Promise<{ checkoutUrl: string; qrCode: string }> => {
  try {
    console.log("Creating payment link for:", bookingId);

    const response = await api.post<{
      checkoutUrl: string;
      qrCode: string;
      data?: { checkoutUrl: string; qrCode: string };
    }>(`/bookings/${bookingId}/payment/link`);

    console.log("✅ Payment link response:", response.data);

    const data = response.data.data || response.data;

    if (data.checkoutUrl && data.qrCode) {
      return {
        checkoutUrl: data.checkoutUrl,
        qrCode: data.qrCode,
      };
    }

    throw new Error("Invalid payment link response");
  } catch (error) {
    handleError(error, "createPaymentLink");
    throw error;
  }
};

/**
 * GET /api/bookings/{id}/payment
 * Get payment status for booking
 */
export const getPaymentStatus = async (
  bookingId: string
): Promise<{ current: { depositStatus: DepositStatus } }> => {
  try {
    console.log("Fetching payment status for:", bookingId);

    const response = await api.get<{
      current: { depositStatus: DepositStatus };
    }>(`/bookings/${bookingId}/payment`);

    console.log("✅ Payment status response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "getPaymentStatus");
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/cancel
 * Cancel booking (pending/reserved -> cancelled)
 */
export const cancelBooking = async (
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Cancelling booking:", bookingId);

    const response = await api.post<{ success: boolean; message: string }>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );

    console.log("✅ Cancel booking response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "cancelBooking");
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/refund
 * Refund deposit for booking
 */
export const refundBooking = async (
  bookingId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Refunding booking:", bookingId);

    const response = await api.post<{ success: boolean; message: string }>(
      `/bookings/${bookingId}/refund`
    );

    console.log("✅ Refund booking response:", response.data);

    return response.data;
  } catch (error) {
    handleError(error, "refundBooking");
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============

/**
 * Get status color for UI
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
  const statusColors: Record<BookingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reserved: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Get status label for UI
 */
export const getBookingStatusLabel = (status: BookingStatus): string => {
  const statusLabels: Record<BookingStatus, string> = {
    pending: "Pending",
    reserved: "Reserved",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
  };

  return statusLabels[status] || status;
};

/**
 * Get deposit status color for UI
 */
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

/**
 * Format currency VND
 */
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

/**
 * Check if booking hold expired
 */
export const isBookingExpired = (holdExpiresAt?: string | null): boolean => {
  if (!holdExpiresAt) return false;
  return new Date(holdExpiresAt) < new Date();
};

/**
 * Calculate rental duration in days
 */
export const calculateDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Format date to Vietnamese locale
 */
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
  createBooking,
  getMyBookings,
  getBookingById,
  createPaymentLink,
  getPaymentStatus,
  cancelBooking,
  refundBooking,
  getBookingStatusColor,
  getBookingStatusLabel,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateDuration,
  formatDate,
};

export default bookingApi;

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
  | "expired";

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
  id?: string; // Backend sometimes returns this
};

// ✅ Vehicle info (populated)
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

// ✅ Station info (populated)
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

// ✅ Main Booking interface
export type Booking = {
  _id: string;
  renter: string | Renter;
  vehicle: string | VehicleInBooking;
  station: string | StationInfo;
  company: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  deposit: DepositInfo;
  holdExpiresAt: string | null;

  // ✅ Payment URLs (from createBooking response)
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
  cancellationPolicySnapshot: {
    windows: any[];
    specialCases: any[];
  };
  amounts: BookingAmounts;
  amountEstimated?: number;
  pricingSnapshot?: PricingSnapshot;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

// ✅ Create booking request
export type CreateBookingRequest = {
  vehicleId: string;
  startTime: string;
  endTime: string;
  deposit: {
    provider: "payos";
  };
};

// ✅ Create booking response (has extra fields)
export type CreateBookingResponse = Booking & {
  checkoutUrl: string;
  qrCode: string;
};

// ✅ Paginated response
export type PaginatedBookingsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Booking[];
};

// ✅ Query params
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
): Promise<CreateBookingResponse> => {
  try {
    console.log("🔄 Creating booking with data:", data);

    const response = await api.post<any>("/bookings", data);

    console.log("✅ Create booking raw response:", response.data);

    // ✅ Backend returns different format - normalize it
    if (response.data) {
      // Check if wrapped in success/data
      const bookingData = response.data.data || response.data;

      // ✅ Backend returns "bookingId" instead of "_id"
      const normalizedResponse: CreateBookingResponse = {
        _id: bookingData.bookingId || bookingData._id || "",
        renter: bookingData.renter || "",
        vehicle: bookingData.vehicle || "",
        station: bookingData.station || "",
        company: bookingData.company || null,
        startTime: bookingData.startTime || "",
        endTime: bookingData.endTime || "",
        status: bookingData.status || "pending",
        deposit: bookingData.deposit || {
          amount: 0,
          currency: "VND",
          provider: "payos",
          providerRef: null,
          status: "none",
        },
        holdExpiresAt: bookingData.holdExpiresAt || null,

        // ✅ Extract payment URLs from multiple possible locations
        checkoutUrl:
          bookingData.checkoutUrl ||
          bookingData.deposit?.payos?.checkoutUrl ||
          "",
        qrCode: bookingData.qrCode || bookingData.deposit?.payos?.qrCode || "",

        counterCheck: bookingData.counterCheck || {
          licenseSnapshot: [],
          contractPhotos: [],
        },
        handoverPhotos: bookingData.handoverPhotos || {
          exteriorBefore: [],
          interiorBefore: [],
          exteriorAfter: [],
          interiorAfter: [],
        },
        cancellationPolicySnapshot: bookingData.cancellationPolicySnapshot || {
          windows: [],
          specialCases: [],
        },
        amounts: bookingData.amounts || {
          rentalEstimated: bookingData.amountEstimated || 0,
          overKmFee: 0,
          lateFee: 0,
          batteryFee: 0,
          damageCharge: 0,
          discounts: 0,
          subtotal: bookingData.amountEstimated || 0,
          tax: 0,
          grandTotal: bookingData.amountEstimated || 0,
          totalPaid: 0,
        },
        amountEstimated: bookingData.amountEstimated || 0,
        pricingSnapshot: bookingData.pricingSnapshot || {
          baseUnit: "day",
          basePrice: 0,
        },
        createdAt: bookingData.createdAt || new Date().toISOString(),
        updatedAt: bookingData.updatedAt || new Date().toISOString(),
      };

      console.log("✅ Normalized booking response:", normalizedResponse);

      // ✅ Validate we have at least an ID
      if (!normalizedResponse._id) {
        console.error("❌ Missing ID in response:", bookingData);
        throw new Error(
          "Invalid booking response: missing both _id and bookingId"
        );
      }

      return normalizedResponse;
    }

    throw new Error("Invalid booking response: empty data");
  } catch (error) {
    handleError(error, "createBooking");
    throw error;
  }
};

/**
 * GET /api/bookings/mine
 * Get user's bookings with pagination and filters
 */
export const getUserBookings = async (
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

    const response = await api.get<any>("/bookings/mine", {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      },
    });

    console.log("✅ Get bookings raw response:", response.data);

    // ✅ Backend returns: { success, page, limit, total, totalPages, items }
    if (response.data.success && response.data.items) {
      return {
        success: response.data.success,
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
        items: response.data.items, // ✅ Use "items" not "data"
      };
    }

    throw new Error("Invalid bookings response format");
  } catch (error) {
    handleError(error, "getUserBookings");
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

    const response = await api.get(`/bookings/${bookingId}`);

    console.log("✅ Get booking response:", response.data);

    // ✅ Handle different response formats
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // Direct booking object
    if (response.data._id) {
      return response.data;
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
): Promise<{ current: { depositStatus: DepositStatus }; deposit?: any }> => {
  try {
    console.log("Fetching payment status for:", bookingId);

    const response = await api.get(`/bookings/${bookingId}/payment`);

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

export const getBookingStatusLabel = (status: BookingStatus): string => {
  const statusLabels: Record<BookingStatus, string> = {
    pending: "Pending",
    reserved: "Reserved",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancled",
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
  createBooking,
  getUserBookings,
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

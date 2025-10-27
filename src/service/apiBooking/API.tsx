// service/apiBooking/API.tsx
import { AxiosError } from "axios";
import api from "../Utils";
// import api from "../../Utils";

// ============ INTERFACES ============

// Renter info
export interface Renter {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

// Deposit info
export interface Deposit {
  amount: number;
  currency: string;
  provider: string;
  status: "pending" | "captured" | "failed" | "refunded";
  providerRef?: string;
  payos?: {
    orderCode: number;
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
  };
}

// Pricing snapshot
export interface PricingSnapshot {
  baseUnit: "hour" | "day";
  basePrice: number;
  computedQty?: number;
}

// Vehicle in booking (can be populated or just ID)
export interface VehicleInBooking {
  _id: string;
  brand?: string;
  model?: string;
  plateNumber?: string;
  [key: string]: any;
}

// Booking interface
export interface Booking {
  _id?: string;
  bookingId?: string;
  renter: Renter | string;
  vehicle?: VehicleInBooking | string;
  status: "pending" | "reserved" | "active" | "completed" | "cancelled";
  holdExpiresAt?: string;
  deposit?: Deposit;
  pricingSnapshot?: PricingSnapshot;
  amountEstimated?: number;
  checkoutUrl?: string;
  qrCode?: string;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create booking request
export interface CreateBookingRequest {
  vehicleId: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  deposit: {
    provider: "payos";
  };
}

// ============ ERROR HANDLER ============

const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("Booking API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
  });

  let errorMessage = err?.message || "Unknown error";
  if (err?.response?.data) {
    const responseData: any = err.response.data;
    if (responseData.message) {
      errorMessage = responseData.message;
    }
  }

  throw new Error(errorMessage);
};

// ============ API FUNCTIONS ============

/**
 * POST /api/bookings
 * Tạo booking mới với thanh toán cọc PayOS
 */
export const createBooking = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  try {
    const response = await api.post("/bookings", data);

    console.log("✅ Create booking response:", response.data);

    // Backend returns data directly at root level
    if (response.data && response.data.bookingId) {
      return response.data;
    }

    throw new Error("Invalid booking response: missing bookingId");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/payment/link
 * Tạo lại link thanh toán booking (khi link cũ hết hạn)
 */
export const createPaymentLink = async (
  bookingId: string
): Promise<{ checkoutUrl: string; qrCode: string }> => {
  try {
    const response = await api.post(`/bookings/${bookingId}/payment/link`);

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
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/cancel
 * Hủy booking (pending/reserved -> cancelled)
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const response = await api.post(`/bookings/${bookingId}/cancel`);

    console.log("✅ Cancel booking response:", response.data);

    if (response.status === 200 || response.status === 201) {
      return;
    }

    throw new Error("Failed to cancel booking");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/bookings/{id}/refund
 * Refund deposit booking
 */
export const refundBooking = async (bookingId: string): Promise<void> => {
  try {
    const response = await api.post(`/bookings/${bookingId}/refund`);

    console.log("✅ Refund booking response:", response.data);

    if (response.status === 200 || response.status === 201) {
      return;
    }

    throw new Error("Failed to refund booking");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/bookings/{id}/payment
 * Lấy trạng thái thanh toán booking
 */
export const getPaymentStatus = async (bookingId: string): Promise<any> => {
  try {
    const response = await api.get(`/bookings/${bookingId}/payment`);

    console.log("✅ Payment status response:", response.data);

    // Backend trả về object với current.depositStatus
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/bookings/mine
 * Danh sách booking của tôi (user đang login)
 */
export const getMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await api.get("/bookings/mine");

    console.log("✅ My bookings response:", response.data);

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    if (response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/bookings/{id}
 * Lấy chi tiết 1 booking
 * Response: { success: true, data: {...} }
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);

    console.log("✅ Booking detail response:", response.data);

    // ✅ Backend response: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // ✅ Fallback: direct data
    if (response.data.bookingId || response.data._id) {
      return response.data;
    }

    throw new Error("Booking not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============

/**
 * Get status color for UI
 */
export const getBookingStatusColor = (status: Booking["status"]): string => {
  const statusColors = {
    pending: "bg-yellow-500 text-white",
    reserved: "bg-blue-500 text-white",
    active: "bg-green-500 text-white",
    completed: "bg-gray-500 text-white",
    cancelled: "bg-red-500 text-white",
  };

  return statusColors[status] || "bg-gray-500 text-white";
};

/**
 * Get deposit status color for UI
 */
export const getDepositStatusColor = (status: Deposit["status"]): string => {
  const statusColors = {
    pending: "bg-yellow-500 text-white",
    captured: "bg-green-500 text-white",
    failed: "bg-red-500 text-white",
    refunded: "bg-blue-500 text-white",
  };

  return statusColors[status] || "bg-gray-500 text-white";
};

/**
 * Format currency VND
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "đ";
};

/**
 * Check if booking is expired (hold time)
 */
export const isBookingExpired = (holdExpiresAt?: string): boolean => {
  if (!holdExpiresAt) return false;
  return new Date(holdExpiresAt) < new Date();
};

/**
 * Calculate total amount
 */
export const calculateTotalAmount = (
  basePrice: number,
  quantity: number,
  depositAmount: number
): number => {
  return basePrice * quantity + depositAmount;
};

// Export default
const bookingApi = {
  createBooking,
  createPaymentLink,
  cancelBooking,
  refundBooking,
  getPaymentStatus,
  getMyBookings,
  getBookingById,
  getBookingStatusColor,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateTotalAmount,
};

export default bookingApi;

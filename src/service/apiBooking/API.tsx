// service/apiBooking/API.tsx
import axios from "axios";
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
  id?: string;
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

// ✅ PayOS Last Webhook
export type PayOSLastWebhook = {
  code: string;
  desc: string;
  success: boolean;
  data: Record<string, unknown>;
  signature: string;
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
    amountCaptured?: number;
    paidAt?: string;
    lastWebhook?: PayOSLastWebhook;
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

// ✅ Cancellation policy
export type CancellationPolicy = {
  windows: Array<Record<string, unknown>>;
  specialCases: Array<Record<string, unknown>>;
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
  cancellationPolicySnapshot: CancellationPolicy;
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

// ✅ Payment status response
export type PaymentStatusResponse = {
  success?: boolean;
  current: Booking;
  deposit?: DepositInfo;
};

// ✅ Generic API response wrapper
type ApiResponseWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// ==== Admin Transactions types ====
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

/**
 * Type guard to check if object has a property
 */
const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return key in obj;
};

/**
 * Normalize deposit info from various response formats
 */
const normalizeDepositInfo = (deposit: unknown): DepositInfo => {
  if (!deposit || typeof deposit !== "object") {
    return {
      amount: 0,
      currency: "VND",
      provider: "payos",
      providerRef: null,
      status: "none",
    };
  }

  const dep = deposit as Record<string, unknown>;

  return {
    amount: typeof dep.amount === "number" ? dep.amount : 0,
    currency: typeof dep.currency === "string" ? dep.currency : "VND",
    provider: typeof dep.provider === "string" ? dep.provider : "payos",
    providerRef: typeof dep.providerRef === "string" ? dep.providerRef : null,
    status:
      typeof dep.status === "string" ? (dep.status as DepositStatus) : "none",
    payos:
      dep.payos && typeof dep.payos === "object"
        ? {
            orderCode:
              typeof (dep.payos as Record<string, unknown>).orderCode ===
              "number"
                ? ((dep.payos as Record<string, unknown>).orderCode as number)
                : 0,
            paymentLinkId:
              typeof (dep.payos as Record<string, unknown>).paymentLinkId ===
              "string"
                ? ((dep.payos as Record<string, unknown>)
                    .paymentLinkId as string)
                : "",
            checkoutUrl:
              typeof (dep.payos as Record<string, unknown>).checkoutUrl ===
              "string"
                ? ((dep.payos as Record<string, unknown>).checkoutUrl as string)
                : "",
            qrCode:
              typeof (dep.payos as Record<string, unknown>).qrCode === "string"
                ? ((dep.payos as Record<string, unknown>).qrCode as string)
                : "",
            amountCaptured:
              typeof (dep.payos as Record<string, unknown>).amountCaptured ===
              "number"
                ? ((dep.payos as Record<string, unknown>)
                    .amountCaptured as number)
                : undefined,
            paidAt:
              typeof (dep.payos as Record<string, unknown>).paidAt === "string"
                ? ((dep.payos as Record<string, unknown>).paidAt as string)
                : undefined,
            lastWebhook: (dep.payos as Record<string, unknown>).lastWebhook as
              | PayOSLastWebhook
              | undefined,
          }
        : undefined,
  };
};

/**
 * Normalize booking amounts
 */
const normalizeAmounts = (
  amounts: unknown,
  amountEstimated?: number
): BookingAmounts => {
  if (!amounts || typeof amounts !== "object") {
    return {
      rentalEstimated: amountEstimated || 0,
      overKmFee: 0,
      lateFee: 0,
      batteryFee: 0,
      damageCharge: 0,
      discounts: 0,
      subtotal: amountEstimated || 0,
      tax: 0,
      grandTotal: amountEstimated || 0,
      totalPaid: 0,
    };
  }

  const amt = amounts as Record<string, unknown>;

  return {
    rentalEstimated:
      typeof amt.rentalEstimated === "number"
        ? amt.rentalEstimated
        : amountEstimated || 0,
    overKmFee: typeof amt.overKmFee === "number" ? amt.overKmFee : 0,
    lateFee: typeof amt.lateFee === "number" ? amt.lateFee : 0,
    batteryFee: typeof amt.batteryFee === "number" ? amt.batteryFee : 0,
    damageCharge: typeof amt.damageCharge === "number" ? amt.damageCharge : 0,
    discounts: typeof amt.discounts === "number" ? amt.discounts : 0,
    subtotal:
      typeof amt.subtotal === "number" ? amt.subtotal : amountEstimated || 0,
    tax: typeof amt.tax === "number" ? amt.tax : 0,
    grandTotal:
      typeof amt.grandTotal === "number"
        ? amt.grandTotal
        : amountEstimated || 0,
    totalPaid: typeof amt.totalPaid === "number" ? amt.totalPaid : 0,
  };
};

/**
 * Normalize pricing snapshot
 */
const normalizePricingSnapshot = (
  pricingSnapshot: unknown
): PricingSnapshot => {
  if (!pricingSnapshot || typeof pricingSnapshot !== "object") {
    return {
      baseUnit: "day",
      basePrice: 0,
    };
  }

  const ps = pricingSnapshot as Record<string, unknown>;

  return {
    baseUnit:
      ps.baseUnit === "hour" || ps.baseUnit === "day" ? ps.baseUnit : "day",
    basePrice: typeof ps.basePrice === "number" ? ps.basePrice : 0,
    computedQty:
      typeof ps.computedQty === "number" ? ps.computedQty : undefined,
  };
};

/**
 * Normalize full booking object
 */
const normalizeBooking = (data: unknown): Booking => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid booking data: not an object");
  }

  const booking = data as Record<string, unknown>;
  const bookingId =
    typeof booking.bookingId === "string"
      ? booking.bookingId
      : typeof booking._id === "string"
      ? booking._id
      : typeof booking.id === "string"
      ? booking.id
      : "";

  if (!bookingId) {
    throw new Error("Invalid booking response: missing ID");
  }

  return {
    _id: bookingId,
    renter: booking.renter || "",
    vehicle: booking.vehicle || "",
    station: booking.station || "",
    company: typeof booking.company === "string" ? booking.company : null,
    startTime: typeof booking.startTime === "string" ? booking.startTime : "",
    endTime: typeof booking.endTime === "string" ? booking.endTime : "",
    status:
      typeof booking.status === "string"
        ? (booking.status as BookingStatus)
        : "pending",
    deposit: normalizeDepositInfo(booking.deposit),
    holdExpiresAt:
      typeof booking.holdExpiresAt === "string" ? booking.holdExpiresAt : null,
    checkoutUrl:
      typeof booking.checkoutUrl === "string"
        ? booking.checkoutUrl
        : booking.deposit &&
          typeof booking.deposit === "object" &&
          hasProperty(booking.deposit, "payos") &&
          typeof booking.deposit.payos === "object" &&
          hasProperty(booking.deposit.payos, "checkoutUrl") &&
          typeof booking.deposit.payos.checkoutUrl === "string"
        ? booking.deposit.payos.checkoutUrl
        : "",
    qrCode:
      typeof booking.qrCode === "string"
        ? booking.qrCode
        : booking.deposit &&
          typeof booking.deposit === "object" &&
          hasProperty(booking.deposit, "payos") &&
          typeof booking.deposit.payos === "object" &&
          hasProperty(booking.deposit.payos, "qrCode") &&
          typeof booking.deposit.payos.qrCode === "string"
        ? booking.deposit.payos.qrCode
        : "",
    counterCheck:
      booking.counterCheck &&
      typeof booking.counterCheck === "object" &&
      hasProperty(booking.counterCheck, "licenseSnapshot") &&
      Array.isArray(booking.counterCheck.licenseSnapshot) &&
      hasProperty(booking.counterCheck, "contractPhotos") &&
      Array.isArray(booking.counterCheck.contractPhotos)
        ? {
            licenseSnapshot: booking.counterCheck.licenseSnapshot as string[],
            contractPhotos: booking.counterCheck.contractPhotos as string[],
          }
        : {
            licenseSnapshot: [],
            contractPhotos: [],
          },
    handoverPhotos:
      booking.handoverPhotos && typeof booking.handoverPhotos === "object"
        ? {
            exteriorBefore: Array.isArray(
              (booking.handoverPhotos as Record<string, unknown>).exteriorBefore
            )
              ? ((booking.handoverPhotos as Record<string, unknown>)
                  .exteriorBefore as string[])
              : [],
            interiorBefore: Array.isArray(
              (booking.handoverPhotos as Record<string, unknown>).interiorBefore
            )
              ? ((booking.handoverPhotos as Record<string, unknown>)
                  .interiorBefore as string[])
              : [],
            exteriorAfter: Array.isArray(
              (booking.handoverPhotos as Record<string, unknown>).exteriorAfter
            )
              ? ((booking.handoverPhotos as Record<string, unknown>)
                  .exteriorAfter as string[])
              : [],
            interiorAfter: Array.isArray(
              (booking.handoverPhotos as Record<string, unknown>).interiorAfter
            )
              ? ((booking.handoverPhotos as Record<string, unknown>)
                  .interiorAfter as string[])
              : [],
          }
        : {
            exteriorBefore: [],
            interiorBefore: [],
            exteriorAfter: [],
            interiorAfter: [],
          },
    cancellationPolicySnapshot:
      booking.cancellationPolicySnapshot &&
      typeof booking.cancellationPolicySnapshot === "object"
        ? {
            windows: Array.isArray(
              (booking.cancellationPolicySnapshot as Record<string, unknown>)
                .windows
            )
              ? ((booking.cancellationPolicySnapshot as Record<string, unknown>)
                  .windows as Array<Record<string, unknown>>)
              : [],
            specialCases: Array.isArray(
              (booking.cancellationPolicySnapshot as Record<string, unknown>)
                .specialCases
            )
              ? ((booking.cancellationPolicySnapshot as Record<string, unknown>)
                  .specialCases as Array<Record<string, unknown>>)
              : [],
          }
        : {
            windows: [],
            specialCases: [],
          },
    amounts: normalizeAmounts(
      booking.amounts,
      typeof booking.amountEstimated === "number"
        ? booking.amountEstimated
        : undefined
    ),
    amountEstimated:
      typeof booking.amountEstimated === "number" ? booking.amountEstimated : 0,
    pricingSnapshot: normalizePricingSnapshot(booking.pricingSnapshot),
    createdAt:
      typeof booking.createdAt === "string"
        ? booking.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof booking.updatedAt === "string"
        ? booking.updatedAt
        : new Date().toISOString(),
    __v: typeof booking.__v === "number" ? booking.__v : undefined,
  };
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

    const response = await api.post<
      ApiResponseWrapper<Record<string, unknown>>
    >("/bookings", data);

    console.log("✅ Create booking raw response:", response.data);

    if (!response.data) {
      throw new Error("Invalid booking response: empty data");
    }

    const bookingData = response.data.data || response.data;
    const normalized = normalizeBooking(bookingData);

    console.log("✅ Normalized booking response:", normalized);

    return normalized as CreateBookingResponse;
  } catch (error) {
    return handleError(error, "createBooking");
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

    const response = await api.get<
      ApiResponseWrapper<{
        success: boolean;
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        items: Booking[];
      }>
    >("/bookings/mine", {
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

    const data = response.data.data || response.data;

    if (
      typeof data === "object" &&
      data &&
      "success" in data &&
      data.success &&
      "items" in data &&
      Array.isArray(data.items)
    ) {
      return {
        success: data.success,
        page: typeof data.page === "number" ? data.page : page,
        limit: typeof data.limit === "number" ? data.limit : limit,
        total: typeof data.total === "number" ? data.total : 0,
        totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
        items: data.items,
      };
    }

    throw new Error("Invalid bookings response format");
  } catch (error) {
    return handleError(error, "getUserBookings");
  }
};

/**
 * GET /api/bookings/{id}
 * Get booking details by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    console.log("Fetching booking:", bookingId);

    const response = await api.get<ApiResponseWrapper<Record<string, unknown>>>(
      `/bookings/${bookingId}`
    );

    console.log("✅ Get booking response:", response.data);

    let bookingData: unknown;

    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success &&
      "data" in response.data
    ) {
      bookingData = response.data.data;
    } else if (
      response.data &&
      typeof response.data === "object" &&
      "_id" in response.data
    ) {
      bookingData = response.data;
    } else {
      throw new Error("Booking not found");
    }

    return normalizeBooking(bookingData);
  } catch (error) {
    return handleError(error, "getBookingById");
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

    const response = await api.post<
      ApiResponseWrapper<{ checkoutUrl: string; qrCode: string }>
    >(`/bookings/${bookingId}/payment/link`);

    console.log("✅ Payment link response:", response.data);

    const data = response.data.data || response.data;

    if (
      !data ||
      typeof data !== "object" ||
      !("checkoutUrl" in data) ||
      !("qrCode" in data) ||
      typeof data.checkoutUrl !== "string" ||
      typeof data.qrCode !== "string"
    ) {
      throw new Error("Invalid payment link response: missing URLs");
    }

    return {
      checkoutUrl: data.checkoutUrl,
      qrCode: data.qrCode,
    };
  } catch (error) {
    return handleError(error, "createPaymentLink");
  }
};

/**
 * GET /api/bookings/{id}/payment
 * Get payment status for booking - THEN fetch full booking
 */
export const getPaymentStatus = async (
  bookingId: string
): Promise<PaymentStatusResponse> => {
  try {
    console.log("📡 Fetching full booking for payment status:", bookingId);

    // ✅ SIMPLE: Just get full booking - it has everything!
    const fullBooking = await getBookingById(bookingId);

    console.log("✅ Full booking with QR code:", {
      hasQrCode: !!fullBooking.deposit?.payos?.qrCode,
      qrCode: fullBooking.deposit?.payos?.qrCode,
    });

    return {
      success: true,
      current: fullBooking,
      deposit: fullBooking.deposit,
    };
  } catch (error) {
    return handleError(error, "getPaymentStatus");
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

    return {
      success: response.data.success !== false,
      message: response.data.message || "Booking cancelled successfully",
    };
  } catch (error) {
    return handleError(error, "cancelBooking");
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

    return {
      success: response.data.success !== false,
      message: response.data.message || "Refund processed successfully",
    };
  } catch (error) {
    return handleError(error, "refundBooking");
  }
};

/**
 * GET /api/bookings/admin/transactions
 * Admin list payment transactions with filters
 */
export const getAdminTransactions = async (
  params: {
    provider?: string;
    status?: AdminTransactionStatus | "--";
    companyId?: string;
    renterId?: string;
    vehicleId?: string;
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
      companyId,
      renterId,
      vehicleId,
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
          ...(companyId && { companyId }),
          ...(renterId && { renterId }),
          ...(vehicleId && { vehicleId }),
          ...(search && { search }),
          ...(from && { from }),
          ...(to && { to }),
          ...(dateField && { dateField }),
        },
      }
    );

    return response.data;
  } catch (error) {
    return handleError(error, "getAdminTransactions");
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
  createBooking,
  getUserBookings,
  getBookingById,
  createPaymentLink,
  getPaymentStatus,
  cancelBooking,
  refundBooking,
  getAdminTransactions,
  getBookingStatusColor,
  getBookingStatusLabel,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateDuration,
  formatDate,
};

export default bookingApi;

// service/apiUser/booking/API.tsx
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
    exterior: Array<
      | {
          _id: string;
          url: string;
          type: string;
        }
      | string
    >;
    interior: Array<
      | {
          _id: string;
          url: string;
          type: string;
        }
      | string
    >;
  };
  photos?: string[];
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

export type BookingRating = {
  score: number;
  comment?: string;
  submittedAt: string;
};

export type IncidentPhoto = {
  url?: string;
  publicId?: string;
  type?: string;
  uploadedAt?: string;
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
  rating?: BookingRating;
  userIncidentReport?: {
    reported: boolean;
    description?: string;
    photos: IncidentPhoto[];
    reportedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type CreateBookingRequest = {
  vehicleId: string;
  startTime: string;
  endTime: string;
  deposit: {
    provider: "payos";
  };
};

export type CreateBookingResponse = Booking & {
  checkoutUrl: string;
  qrCode: string;
};

export type PaginatedBookingsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Booking[];
};

export type PaymentStatusResponse = {
  success?: boolean;
  current: Booking;
  deposit?: DepositInfo;
};

export type ExtendBookingRequest = {
  addHours?: number;
  addDays?: number;
};

export type ExtendBookingResponse = {
  success: boolean;
  message: string;
  booking?: Booking;
  additionalCharge: number;
  newEndTime: string;
  payment?: {
    provider: string;
    type: "extension";
    orderCode: number;
    checkoutUrl: string;
    qrCode: string;
  };
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

export type ContractData = {
  bookingId: string;
  status: string;
  vehicle: {
    plateNumber: string;
    brand: string;
    model: string;
    id?: string;
    isPartnerVehicle?: boolean;
  };
  renter: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    id?: string;
  };
  contract: {
    _id: string;
    url: string;
    publicId: string;
    type: string;
    provider: string;
    tags: string[];
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
  };
  startTime: string;
  endTime: string;
  createdAt: string;
};

export type ContractResponse = {
  success: boolean;
  data: ContractData;
  message?: string;
};

type ApiResponseWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type SubmitRatingRequest = {
  score: number;
  comment?: string;
};

export type RatingData = {
  score: number;
  comment?: string;
  submittedAt: string;
};

export type SubmitRatingResponse = {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    rating: RatingData;
  };
};

export type ReportIncidentRequest = {
  description: string;
  incidentPhotos?: string[];
};

export type UserIncidentReport = {
  reported: boolean;
  description: string;
  photos: IncidentPhoto[];
  reportedAt: string;
};

export type ReportIncidentResponse = {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    userIncidentReport: UserIncidentReport;
    vehicle: Record<string, unknown>;
  };
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

const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return key in obj;
};

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
    bookingId:
      typeof booking.bookingId === "string" ? booking.bookingId : bookingId,
    renter: booking.renter as string | Renter,
    vehicle: booking.vehicle as string | VehicleInBooking,
    station: booking.station as string | StationInfo,
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
          booking.deposit.payos !== null &&
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
          booking.deposit.payos !== null &&
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
    // ✅ Add rating field
    rating:
      booking.rating && typeof booking.rating === "object"
        ? {
            score:
              typeof (booking.rating as Record<string, unknown>).score ===
              "number"
                ? ((booking.rating as Record<string, unknown>).score as number)
                : 0,
            comment:
              typeof (booking.rating as Record<string, unknown>).comment ===
              "string"
                ? ((booking.rating as Record<string, unknown>)
                    .comment as string)
                : undefined,
            submittedAt:
              typeof (booking.rating as Record<string, unknown>).submittedAt ===
              "string"
                ? ((booking.rating as Record<string, unknown>)
                    .submittedAt as string)
                : new Date().toISOString(),
          }
        : undefined,
    // ✅ Add userIncidentReport field
    userIncidentReport:
      booking.userIncidentReport &&
      typeof booking.userIncidentReport === "object"
        ? {
            reported:
              typeof (booking.userIncidentReport as Record<string, unknown>)
                .reported === "boolean"
                ? ((booking.userIncidentReport as Record<string, unknown>)
                    .reported as boolean)
                : false,
            description:
              typeof (booking.userIncidentReport as Record<string, unknown>)
                .description === "string"
                ? ((booking.userIncidentReport as Record<string, unknown>)
                    .description as string)
                : undefined,
            photos: Array.isArray(
              (booking.userIncidentReport as Record<string, unknown>).photos
            )
              ? ((booking.userIncidentReport as Record<string, unknown>)
                  .photos as IncidentPhoto[])
              : [],
            reportedAt:
              typeof (booking.userIncidentReport as Record<string, unknown>)
                .reportedAt === "string"
                ? ((booking.userIncidentReport as Record<string, unknown>)
                    .reportedAt as string)
                : undefined,
          }
        : undefined,
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

// ============ USER API FUNCTIONS ============

/**
 * POST /api/bookings
 * Create a new booking
 */
export const createBooking = async (
  data: CreateBookingRequest
): Promise<CreateBookingResponse> => {
  try {
    const response = await api.post<
      ApiResponseWrapper<Record<string, unknown>>
    >("/bookings", data);
    if (!response.data) throw new Error("Invalid booking response: empty data");
    const bookingData = response.data.data || response.data;
    const normalized = normalizeBooking(bookingData);
    return normalized as CreateBookingResponse;
  } catch (err) {
    handleError(err, "createBooking");
    throw err;
  }
};

/**
 * GET /api/bookings/mine
 * Get user's bookings with filters
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
  } catch (err) {
    handleError(err, "getUserBookings");
    throw err;
  }
};

/**
 * GET /api/bookings/{id}
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await api.get<ApiResponseWrapper<Record<string, unknown>>>(
      `/bookings/${bookingId}`
    );

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
  } catch (err) {
    handleError(err, "getBookingById");
    throw err;
  }
};

/**
 * POST /api/bookings/{id}/payment/link
 * Create payment link for booking
 */
export const createPaymentLink = async (
  bookingId: string
): Promise<{ checkoutUrl: string; qrCode: string }> => {
  try {
    const response = await api.post<
      ApiResponseWrapper<{ checkoutUrl: string; qrCode: string }>
    >(`/bookings/${bookingId}/payment/link`);

    const data = response.data.data || response.data;

    if (
      !data ||
      typeof data !== "object" ||
      !("checkoutUrl" in data) ||
      !("qrCode" in data)
    ) {
      throw new Error("Invalid payment link response: missing URLs");
    }

    return {
      checkoutUrl: data.checkoutUrl as string,
      qrCode: data.qrCode as string,
    };
  } catch (err) {
    handleError(err, "createPaymentLink");
    throw err;
  }
};

/**
 * GET /api/bookings/{id}/payment (status)
 * Get payment status for booking
 */
export const getPaymentStatus = async (
  bookingId: string
): Promise<PaymentStatusResponse> => {
  try {
    const fullBooking = await getBookingById(bookingId);
    return {
      success: true,
      current: fullBooking,
      deposit: fullBooking.deposit,
    };
  } catch (err) {
    handleError(err, "getPaymentStatus");
    throw err;
  }
};

/**
 * POST /api/bookings/{id}/cancel
 * Cancel a booking
 */
export const cancelBooking = async (
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );
    return {
      success: response.data.success !== false,
      message: response.data.message || "Booking cancelled successfully",
    };
  } catch (err) {
    handleError(err, "cancelBooking");
    throw err;
  }
};

/**
 * POST /api/bookings/{id}/extend
 * Extend booking duration
 */
export const extendBooking = async (
  bookingId: string,
  data: ExtendBookingRequest
): Promise<ExtendBookingResponse> => {
  try {
    const response = await api.post<
      ApiResponseWrapper<{
        success?: boolean;
        message?: string;
        booking?: Record<string, unknown>;
        additionalCharge?: number;
        newEndTime?: string;
        payment?: {
          provider: string;
          type: "extension";
          orderCode: number;
          checkoutUrl: string;
          qrCode: string;
        };
      }>
    >(`/bookings/${bookingId}/extend`, data);

    let payload: {
      success?: boolean;
      message?: string;
      booking?: Record<string, unknown>;
      additionalCharge?: number;
      newEndTime?: string;
      payment?: {
        provider: string;
        type: "extension";
        orderCode: number;
        checkoutUrl: string;
        qrCode: string;
      };
    };

    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data &&
      response.data.data &&
      typeof response.data.data === "object"
    ) {
      payload = response.data.data;
    } else if (response.data && typeof response.data === "object") {
      payload = response.data as typeof payload;
    } else {
      throw new Error("Invalid extend booking response");
    }

    let normalizedBooking: Booking | undefined;
    if (payload.booking) {
      try {
        normalizedBooking = normalizeBooking(payload.booking);
      } catch (normalizeError) {
        console.warn("Could not normalize extended booking:", normalizeError);
      }
    }

    return {
      success: payload.success ?? true,
      message: payload.message ?? "Booking extended successfully",
      booking: normalizedBooking,
      additionalCharge: payload.additionalCharge ?? 0,
      newEndTime: payload.newEndTime ?? "",
      payment: payload.payment,
    };
  } catch (err) {
    handleError(err, "extendBooking");
    throw err;
  }
};

/**
 * GET /api/bookings/{id}/contract
 * Get booking contract
 */
export const getBookingContract = async (
  bookingId: string
): Promise<ContractResponse> => {
  try {
    const response = await api.get<ApiResponseWrapper<ContractData>>(
      `/bookings/${bookingId}/contract`
    );

    const outer = response.data;
    const inner = outer?.data;

    if (!inner || typeof inner !== "object" || !("contract" in inner)) {
      throw new Error("Contract not found for this booking");
    }

    return {
      success: outer.success !== false,
      data: inner,
      message: outer.message,
    };
  } catch (err) {
    handleError(err, "getBookingContract");
    throw err;
  }
};

/**
 * POST /api/bookings/{id}/rating
 * Submit rating for completed booking
 */
export const submitBookingRating = async (
  bookingId: string,
  data: SubmitRatingRequest
): Promise<SubmitRatingResponse> => {
  try {
    if (data.score < 1 || data.score > 5) {
      throw new Error("Rating score must be between 1 and 5");
    }

    const response = await api.post<
      ApiResponseWrapper<{
        bookingId: string;
        rating: {
          score: number;
          comment?: string;
          submittedAt: string;
        };
      }>
    >(`/bookings/${bookingId}/rating`, data);

    const rawPayload = response.data?.data || response.data;

    if (!rawPayload || typeof rawPayload !== "object") {
      throw new Error("Invalid rating response");
    }

    const payload = rawPayload as {
      bookingId?: string;
      rating?: {
        score: number;
        comment?: string;
        submittedAt: string;
      };
    };

    if (!payload.rating) {
      throw new Error("Invalid rating response: missing rating data");
    }

    return {
      success: true,
      message: "Rating submitted successfully",
      data: {
        bookingId: payload.bookingId || bookingId,
        rating: payload.rating,
      },
    };
  } catch (err) {
    handleError(err, "submitBookingRating");
    throw err;
  }
};

/**
 * POST /api/bookings/{id}/report-incident
 * Report vehicle incident
 */
export const reportIncident = async (
  bookingId: string,
  data: ReportIncidentRequest
): Promise<ReportIncidentResponse> => {
  try {
    if (!data.description || data.description.trim().length === 0) {
      throw new Error("Incident description is required");
    }

    if (data.incidentPhotos && data.incidentPhotos.length > 5) {
      throw new Error("Maximum 5 photos allowed for incident report");
    }

    const response = await api.post<
      ApiResponseWrapper<{
        bookingId: string;
        userIncidentReport: {
          reported: boolean;
          description: string;
          photos: Array<Record<string, unknown>>;
          reportedAt: string;
        };
        vehicle: Record<string, unknown>;
      }>
    >(`/bookings/${bookingId}/report-incident`, data);

    const rawPayload = response.data?.data || response.data;

    if (!rawPayload || typeof rawPayload !== "object") {
      throw new Error("Invalid incident report response");
    }

    const payload = rawPayload as {
      bookingId?: string;
      userIncidentReport?: {
        reported: boolean;
        description: string;
        photos: Array<Record<string, unknown>>;
        reportedAt: string;
      };
      vehicle?: Record<string, unknown>;
      message?: string;
    };

    if (!payload.userIncidentReport) {
      throw new Error("Invalid incident report response: missing report data");
    }

    return {
      success: true,
      message:
        payload.message ||
        "Incident reported successfully. Staff will be notified.",
      data: {
        bookingId: payload.bookingId || bookingId,
        userIncidentReport: {
          reported: payload.userIncidentReport.reported,
          description: payload.userIncidentReport.description,
          photos: (payload.userIncidentReport.photos || []).map((photo) => ({
            url: typeof photo.url === "string" ? photo.url : undefined,
            publicId:
              typeof photo.publicId === "string" ? photo.publicId : undefined,
            type: typeof photo.type === "string" ? photo.type : undefined,
            uploadedAt:
              typeof photo.uploadedAt === "string"
                ? photo.uploadedAt
                : undefined,
          })),
          reportedAt: payload.userIncidentReport.reportedAt,
        },
        vehicle: payload.vehicle || {},
      },
    };
  } catch (err) {
    handleError(err, "reportIncident");
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

const userBookingApi = {
  createBooking,
  getUserBookings,
  getBookingById,
  createPaymentLink,
  getPaymentStatus,
  cancelBooking,
  extendBooking,
  getBookingContract,
  submitBookingRating,
  reportIncident,
  getBookingStatusColor,
  getBookingStatusLabel,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateDuration,
  formatDate,
};

export default userBookingApi;

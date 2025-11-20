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
      const responseData = error.response.data as any;
      
      // Try multiple ways to extract error message
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = typeof responseData.error === 'string' 
          ? responseData.error 
          : responseData.error.message || "Server error";
      } else if (responseData.msg) {
        errorMessage = responseData.msg;
      } else if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        errorMessage = responseData.errors[0].message || responseData.errors[0];
      }
    }

    // Add status code context for 500 errors
    if (error.response?.status === 500) {
      errorMessage = errorMessage || "Internal server error. Please try again later or contact support.";
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

    const response = await api.get<
      ApiResponseWrapper<PaginatedBookingsResponse> | PaginatedBookingsResponse
    >("/bookings/booked-vehicles", {
      params: {
        page,
        limit,
      },
    });

    // Normalize response to ensure all required fields are present
    const responseData = (response.data as any).data || response.data;
    
    // If response is wrapped in data, extract it
    if (responseData && typeof responseData === "object") {
      // Check if it has items array (direct format)
      if (Array.isArray(responseData.items)) {
        return {
          success: responseData.success !== false,
          page: typeof responseData.page === "number" ? responseData.page : page,
          limit: typeof responseData.limit === "number" ? responseData.limit : limit,
          total: typeof responseData.total === "number" ? responseData.total : responseData.items.length,
          totalPages: typeof responseData.totalPages === "number" 
            ? responseData.totalPages 
            : Math.ceil((responseData.total || responseData.items.length) / limit),
          items: responseData.items || [],
        };
      }
    }

    // Fallback: return as-is if already in correct format
    return {
      success: (response.data as any).success !== false,
      page: (response.data as any).page || page,
      limit: (response.data as any).limit || limit,
      total: (response.data as any).total || 0,
      totalPages: (response.data as any).totalPages || 1,
      items: (response.data as any).items || [],
    };
  } catch (err) {
    handleError(err, "getBookedVehicles");
    throw err;
  }
};

/**
 * Get bookings by status
 */
const getBookingsByStatus = async (
  status: "reserved" | "active" | "completed" | "cancelled",
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginatedBookingsResponse> => {
  try {
    const { page = 1, limit = 1000 } = params; // Use high limit to get all items

    const response = await api.get<
      ApiResponseWrapper<PaginatedBookingsResponse> | PaginatedBookingsResponse
    >(`/bookings/${status}`, {
      params: {
        page,
        limit,
      },
    });

    const responseData = (response.data as any).data || response.data;
    
    if (responseData && typeof responseData === "object") {
      if (Array.isArray(responseData.items)) {
        return {
          success: responseData.success !== false,
          page: typeof responseData.page === "number" ? responseData.page : page,
          limit: typeof responseData.limit === "number" ? responseData.limit : limit,
          total: typeof responseData.total === "number" ? responseData.total : responseData.items.length,
          totalPages: typeof responseData.totalPages === "number" 
            ? responseData.totalPages 
            : Math.ceil((responseData.total || responseData.items.length) / limit),
          items: responseData.items || [],
        };
      }
    }

    return {
      success: (response.data as any).success !== false,
      page: (response.data as any).page || page,
      limit: (response.data as any).limit || limit,
      total: (response.data as any).total || 0,
      totalPages: (response.data as any).totalPages || 1,
      items: (response.data as any).items || [],
    };
  } catch (err: any) {
    // If endpoint doesn't exist, return empty
    if (err?.response?.status === 404) {
      console.log(`⚠️ /bookings/${status} endpoint not found, returning empty`);
      return {
        success: true,
        page: 1,
        limit: params.limit || 1000,
        total: 0,
        totalPages: 1,
        items: [],
      };
    }
    console.error(`Error fetching ${status} bookings:`, err);
    return {
      success: false,
      page: 1,
      limit: params.limit || 1000,
      total: 0,
      totalPages: 1,
      items: [],
    };
  }
};

/**
 * Get all bookings (all statuses) - combines reserved, active, completed, cancelled
 * Or filter by specific status if provided
 */
export const getAllBookings = async (
  params: {
    page?: number;
    limit?: number;
    status?: "all" | BookingStatus;
  } = {}
): Promise<PaginatedBookingsResponse> => {
  try {
    const { page = 1, limit = 20, status = "all" } = params;

    // If specific status is selected, fetch only that status
    if (status !== "all" && (status === "reserved" || status === "active" || status === "completed" || status === "cancelled")) {
      const statusData = await getBookingsByStatus(status, { page: 1, limit: 1000 });
      
      // Sort by createdAt (newest first)
      const sortedBookings = [...(statusData.items || [])].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      // Calculate pagination
      const total = sortedBookings.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBookings = sortedBookings.slice(startIndex, endIndex);

      return {
        success: true,
        page,
        limit,
        total,
        totalPages,
        items: paginatedBookings,
      };
    }

    // Fetch all bookings from different status endpoints in parallel
    const [reservedData, activeData, completedData, cancelledData] = await Promise.all([
      getBookingsByStatus("reserved", { page: 1, limit: 1000 }),
      getBookingsByStatus("active", { page: 1, limit: 1000 }),
      getBookingsByStatus("completed", { page: 1, limit: 1000 }),
      getBookingsByStatus("cancelled", { page: 1, limit: 1000 }),
    ]);

    // Combine all bookings
    const allBookings = [
      ...(reservedData.items || []),
      ...(activeData.items || []),
      ...(completedData.items || []),
      ...(cancelledData.items || []),
    ];

    // Sort by createdAt (newest first)
    allBookings.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    // Calculate pagination
    const total = allBookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = allBookings.slice(startIndex, endIndex);

    return {
      success: true,
      page,
      limit,
      total,
      totalPages,
      items: paginatedBookings,
    };
  } catch (err) {
    handleError(err, "getAllBookings");
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

    // Handle different response formats
    if (response.data) {
      // If response.data is wrapped in another data property
      if ((response.data as any).data && typeof (response.data as any).data === 'object') {
        return {
          success: (response.data as any).success !== false,
          message: (response.data as any).message || "Damage report approved successfully",
          data: (response.data as any).data,
        };
      }
      // Direct response
      return response.data;
    }

    // Fallback if response structure is different
    return {
      success: true,
      message: "Damage report approved successfully",
    };
  } catch (err) {
    console.error("❌ Error in approveDamageReport:", err);
    handleError(err, "approveDamageReport");
    throw err;
  }
};

export const rejectDamageReport = async (
  damageReportId: string
): Promise<RejectDamageReportResponse> => {
  try {
    console.log("🔄 Rejecting damage report:", damageReportId);

    // Try without body first (some servers don't accept empty body)
    let response;
    try {
      response = await api.post<RejectDamageReportResponse>(
        `/damage-reports/${damageReportId}/reject`
      );
    } catch (firstError: any) {
      // If first attempt fails with 400/422, try with empty body
      if (firstError?.response?.status === 400 || firstError?.response?.status === 422) {
        console.log("⚠️ Retrying with empty body...");
        response = await api.post<RejectDamageReportResponse>(
          `/damage-reports/${damageReportId}/reject`,
          {}
        );
      } else {
        throw firstError;
      }
    }

    console.log("✅ Reject damage report response:", response.data);

    // Handle different response formats
    if (response.data) {
      // If response.data is wrapped in another data property
      if ((response.data as any).data && typeof (response.data as any).data === 'object') {
        return {
          success: (response.data as any).success !== false,
          message: (response.data as any).message || "Damage report rejected successfully",
          data: (response.data as any).data,
        };
      }
      // Direct response
      return response.data;
    }

    // Fallback if response structure is different
    return {
      success: true,
      message: "Damage report rejected successfully",
    };
  } catch (err) {
    console.error("❌ Error in rejectDamageReport:", err);
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

// ============ RATING FUNCTIONS ============

export type BookingRating = {
  _id: string;
  bookingId: string;
  vehicleId?: string;
  renterId?: string;
  renter?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  score: number;
  comment?: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * GET /api/bookings/{bookingId}/rating
 * Get rating for a specific booking
 */
export const getBookingRating = async (
  bookingId: string
): Promise<BookingRating | null> => {
  if (!bookingId || bookingId.trim() === "") {
    console.warn("⚠️ Invalid booking ID provided to getBookingRating");
    return null;
  }

  try {
    // Try the standard endpoint first
    const response = await api.get<{
      success?: boolean;
      data?: BookingRating;
      rating?: BookingRating;
      error?: string;
    }>(`/bookings/${bookingId}/rating`);

    // Check if response has error
    if ((response.data as any)?.error) {
      console.log(`ℹ️ No rating found for booking ${bookingId}: ${(response.data as any).error}`);
      return null;
    }

    // Handle different response formats
    if (response.data) {
      if ((response.data as any).data) {
        return (response.data as any).data;
      }
      if ((response.data as any).rating) {
        return (response.data as any).rating;
      }
      if ((response.data as any)._id) {
        return response.data as BookingRating;
      }
    }

    return null;
  } catch (error: any) {
    // 404 means no rating exists for this booking (not an error, just log quietly)
    if (error?.response?.status === 404) {
      // Check if it's a "Not found" error (expected) vs other 404 errors
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message;
      if (errorMessage === "Not found" || errorMessage?.toLowerCase().includes("not found")) {
        // This is expected - booking doesn't have a rating yet
        return null;
      }
      // Other 404 errors might indicate endpoint doesn't exist
      console.warn(`⚠️ 404 error for booking ${bookingId}:`, errorMessage || "Unknown error");
      return null;
    }
    // Only log actual errors (not 404)
    console.error(`❌ Error fetching booking rating for ${bookingId}:`, error);
    return null;
  }
};

/**
 * Get all bookings for a specific vehicle
 * Only returns completed bookings (as only completed bookings can have ratings)
 */
export const getBookingsByVehicle = async (
  vehicleId: string
): Promise<Booking[]> => {
  try {
    console.log("🔄 Fetching bookings for vehicle:", vehicleId);
    
    // Get completed bookings only (ratings are only for completed bookings)
    const completedBookingsResponse = await getAllBookings({
      status: "completed",
      page: 1,
      limit: 1000, // Get all completed bookings
    });

    // Filter bookings by vehicle ID
    const vehicleBookings = completedBookingsResponse.items.filter((booking) => {
      const bookingVehicleId = typeof booking.vehicle === "string" 
        ? booking.vehicle 
        : booking.vehicle?._id;
      return bookingVehicleId === vehicleId;
    });

    console.log(`✅ Found ${vehicleBookings.length} completed bookings for vehicle ${vehicleId}`);
    return vehicleBookings;
  } catch (error) {
    console.error("❌ Error fetching bookings by vehicle:", error);
    return [];
  }
};

/**
 * Get all ratings for a specific vehicle by fetching bookings and their ratings
 */
export const getVehicleRatingsFromBookings = async (
  vehicleId: string
): Promise<BookingRating[]> => {
  try {
    console.log("🔄 Fetching ratings for vehicle from bookings:", vehicleId);
    
    // Step 1: Get all completed bookings for this vehicle (only completed bookings can have ratings)
    const bookings = await getBookingsByVehicle(vehicleId);
    
    if (bookings.length === 0) {
      console.log("ℹ️ No completed bookings found for vehicle:", vehicleId);
      return [];
    }

    console.log(`📋 Checking ${bookings.length} completed bookings for ratings...`);
    
    // Validate bookings have valid IDs
    const validBookings = bookings.filter(booking => booking._id && booking._id.trim() !== "");
    if (validBookings.length !== bookings.length) {
      console.warn(`⚠️ Filtered out ${bookings.length - validBookings.length} bookings with invalid IDs`);
    }

    // Step 2: Get ratings for each booking in parallel (404 is expected for bookings without ratings)
    const ratingPromises = validBookings.map(async (booking) => {
      if (!booking._id) {
        console.warn("⚠️ Booking missing _id:", booking);
        return { booking, rating: null };
      }
      const rating = await getBookingRating(booking._id);
      return { booking, rating };
    });
    
    const results = await Promise.all(ratingPromises);
    
    // Step 3: Filter out null ratings and map to BookingRating format
    const validRatings = results
      .filter((result): result is { booking: Booking; rating: BookingRating } => result.rating !== null)
      .map((result) => ({
        ...result.rating,
        vehicleId: vehicleId,
        bookingId: result.rating.bookingId || result.booking._id,
        // Ensure renter info is populated from booking if not in rating
        renter: result.rating.renter || (typeof result.booking.renter === 'object' ? {
          _id: result.booking.renter._id,
          name: result.booking.renter.name,
          email: result.booking.renter.email,
          avatar: result.booking.renter.avatar,
        } : undefined),
      }));

    console.log(`✅ Found ${validRatings.length} ratings out of ${bookings.length} completed bookings for vehicle ${vehicleId}`);
    return validRatings;
  } catch (error) {
    console.error("❌ Error fetching vehicle ratings from bookings:", error);
    return [];
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
  getAllBookings,
  getAllDamageReports,
  getDamageReportById,
  getDamageReportByBookingId,
  approveDamageReport,
  rejectDamageReport,
  getBookingRating,
  getBookingsByVehicle,
  getVehicleRatingsFromBookings,
  getBookingStatusColor,
  getBookingStatusLabel,
  getDepositStatusColor,
  formatCurrency,
  isBookingExpired,
  calculateDuration,
  formatDate,
};

export default bookingApi;

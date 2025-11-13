// service/apiManualRefunds/API.tsx
import axios from "axios";
import api from "../../Utils";

// ============ TYPE DEFINITIONS ============

export type ManualRefundStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "completed"
  | "cancelled"
  | "done";

export type ManualRefundCandidate = {
  _id: string;
  bookingId: string;
  renter: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    _id: string;
    plateNumber: string;
    brand: string;
    model: string;
  } | null;
  booking: {
    _id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  amounts: {
    totalPaid: number;
    refundableAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type ManualRefundAttachment = {
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

export type ManualRefund = {
  _id: string;
  booking: {
    _id: string;
    status: string;
    deposit?: {
      amount: number;
      currency: string;
      provider: string;
      providerRef: string;
      status: string;
      payos?: any;
    };
    amounts?: {
      rentalEstimated: number;
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
  };
  renter: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    bankInfo?: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
      bankName: string;
      updatedAt?: string;
    };
  };
  amount: number;
  currency: string;
  method: string;
  transferredAt?: string;
  beneficiary?: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  reference?: string | null;
  staff: {
    _id: string;
    name: string;
    email: string;
  };
  status: ManualRefundStatus;
  note?: string | null;
  attachments: string[]; // Array of URLs
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PaginatedManualRefundsResponse = {
  success: boolean;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  items?: ManualRefund[];
  data?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    items: ManualRefund[];
  };
};

export type PaginatedCandidatesResponse = {
  success: boolean;
  message?: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    items: ManualRefundCandidate[];
  };
};

export type CreateManualRefundRequest = {
  bookingId: string;
  amount: number;
  reason: string;
  note?: string;
};

export type CreateManualRefundResponse = {
  success: boolean;
  message: string;
  data?: ManualRefund;
};

export type GetManualRefundResponse = {
  success: boolean;
  message?: string;
  data: ManualRefund;
};

export type UpdateManualRefundRequest = {
  status?: ManualRefundStatus;
  note?: string;
  attachments?: File[];
};

export type UpdateManualRefundResponse = {
  success: boolean;
  message: string;
  data?: ManualRefund;
};

// ✅ Generic API response wrapper
type ApiResponseWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// ============ ERROR HANDLER ============

const handleError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    console.error(`Manual Refund API Error [${context}]:`, {
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
    console.error(`Manual Refund API Error [${context}]:`, error);
    throw new Error("An unexpected error occurred");
  }
};

// ============ API FUNCTIONS ============

/**
 * GET /api/manual-refunds/candidates
 * Get list of candidates that can be refunded - Staff/Admin only
 */
export const getRefundCandidates = async (
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginatedCandidatesResponse> => {
  try {
    const { page = 1, limit = 20 } = params;

    const response = await api.get<
      ApiResponseWrapper<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        items: ManualRefundCandidate[];
      }>
    >("/manual-refunds/candidates", {
      params: {
        page,
        limit,
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
          page: typeof responseData.page === "number" ? responseData.page : page,
          limit:
            typeof responseData.limit === "number" ? responseData.limit : limit,
          total: typeof responseData.total === "number" ? responseData.total : 0,
          totalPages:
            typeof responseData.totalPages === "number"
              ? responseData.totalPages
              : 1,
          items: Array.isArray(responseData.items) ? responseData.items : [],
        },
      };
    }

    throw new Error("Invalid refund candidates response format");
  } catch (error) {
    return handleError(error, "getRefundCandidates");
  }
};

/**
 * POST /api/manual-refunds
 * Create manual refund request - Staff/Admin only
 */
export const createManualRefund = async (
  data: CreateManualRefundRequest
): Promise<CreateManualRefundResponse> => {
  try {
    console.log("🔄 Creating manual refund request:", data);

    const response = await api.post<CreateManualRefundResponse>(
      "/manual-refunds",
      data
    );

    console.log("✅ Create manual refund response:", response.data);

    return response.data;
  } catch (error) {
    return handleError(error, "createManualRefund");
  }
};

/**
 * GET /api/manual-refunds
 * Get list of refund requests - Staff/Admin only
 */
export const getAllManualRefunds = async (
  params: {
    page?: number;
    limit?: number;
    status?: ManualRefundStatus;
  } = {}
): Promise<PaginatedManualRefundsResponse> => {
  try {
    const { page = 1, limit = 20, status } = params;

    const response = await api.get<
      ApiResponseWrapper<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        items: ManualRefund[];
      }>
    >("/manual-refunds", {
      params: {
        page,
        limit,
        ...(status && { status }),
      },
    });

    // Handle both nested data structure and flat structure
    const rawData = response.data as any;
    
    // Check if response has items directly (flat structure)
    if (rawData && typeof rawData === "object" && "items" in rawData) {
      const flatData = rawData as {
        success?: boolean;
        message?: string;
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        items?: ManualRefund[];
      };
      
      return {
        success: flatData.success !== false,
        message: flatData.message,
        page: typeof flatData.page === "number" ? flatData.page : page,
        limit: typeof flatData.limit === "number" ? flatData.limit : limit,
        total: typeof flatData.total === "number" ? flatData.total : 0,
        totalPages: typeof flatData.totalPages === "number" ? flatData.totalPages : 1,
        items: Array.isArray(flatData.items) ? flatData.items : [],
        data: {
          page: typeof flatData.page === "number" ? flatData.page : page,
          limit: typeof flatData.limit === "number" ? flatData.limit : limit,
          total: typeof flatData.total === "number" ? flatData.total : 0,
          totalPages: typeof flatData.totalPages === "number" ? flatData.totalPages : 1,
          items: Array.isArray(flatData.items) ? flatData.items : [],
        },
      };
    }

    // Check if response has nested data structure
    const responseData = rawData?.data || rawData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "items" in responseData
    ) {
      const nestedData = responseData as {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        items?: ManualRefund[];
      };
      
      return {
        success: rawData.success !== false,
        message: rawData.message,
        page: typeof nestedData.page === "number" ? nestedData.page : page,
        limit: typeof nestedData.limit === "number" ? nestedData.limit : limit,
        total: typeof nestedData.total === "number" ? nestedData.total : 0,
        totalPages: typeof nestedData.totalPages === "number" ? nestedData.totalPages : 1,
        items: Array.isArray(nestedData.items) ? nestedData.items : [],
        data: {
          page: typeof nestedData.page === "number" ? nestedData.page : page,
          limit: typeof nestedData.limit === "number" ? nestedData.limit : limit,
          total: typeof nestedData.total === "number" ? nestedData.total : 0,
          totalPages: typeof nestedData.totalPages === "number" ? nestedData.totalPages : 1,
          items: Array.isArray(nestedData.items) ? nestedData.items : [],
        },
      };
    }

    throw new Error("Invalid manual refunds response format");
  } catch (error) {
    return handleError(error, "getAllManualRefunds");
  }
};

/**
 * GET /api/manual-refunds/{id}
 * Get manual refund request details - Staff/Admin only
 */
export const getManualRefundById = async (
  refundId: string
): Promise<GetManualRefundResponse> => {
  try {
    console.log("🔄 Fetching manual refund by ID:", refundId);

    const response = await api.get<ApiResponseWrapper<ManualRefund>>(
      `/manual-refunds/${refundId}`
    );

    console.log("✅ Get manual refund by ID response:", response.data);

    const responseData = response.data.data || response.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "_id" in responseData
    ) {
      return {
        success: response.data.success !== false,
        message: response.data.message,
        data: responseData as ManualRefund,
      };
    }

    throw new Error("Invalid manual refund response format");
  } catch (error) {
    return handleError(error, "getManualRefundById");
  }
};

/**
 * PATCH /api/manual-refunds/{id}
 * Update manual refund status/note and upload additional attachments - Staff/Admin only
 */
export const updateManualRefund = async (
  refundId: string,
  data: UpdateManualRefundRequest
): Promise<UpdateManualRefundResponse> => {
  try {
    console.log("🔄 Updating manual refund:", refundId, data);

    const formData = new FormData();

    if (data.status) {
      formData.append("status", data.status);
    }

    if (data.note !== undefined) {
      formData.append("note", data.note);
    }

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.patch<UpdateManualRefundResponse>(
      `/manual-refunds/${refundId}`,
      formData
    );

    console.log("✅ Update manual refund response:", response.data);

    return response.data;
  } catch (error) {
    return handleError(error, "updateManualRefund");
  }
};

// ============ HELPER FUNCTIONS ============

export const getRefundStatusColor = (status: ManualRefundStatus | string): string => {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    processing: "bg-purple-100 text-purple-800 border-purple-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    done: "bg-green-100 text-green-800 border-green-200",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getRefundStatusLabel = (status: ManualRefundStatus | string): string => {
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
    done: "Done",
  };

  return statusLabels[status] || status;
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

// ============ EXPORT DEFAULT ============

const manualRefundApi = {
  getRefundCandidates,
  createManualRefund,
  getAllManualRefunds,
  getManualRefundById,
  updateManualRefund,
  getRefundStatusColor,
  getRefundStatusLabel,
  formatCurrency,
};

export default manualRefundApi;


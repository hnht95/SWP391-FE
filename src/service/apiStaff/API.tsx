// src/services/API.jsx
import { AxiosError } from "axios";

import api from "../Utils";
import type { ContractsListResponse } from "../../types/contracts";
import type { RawApiVehicle } from "../../types/vehicle";
import type {
  AdminBookingTransactionsResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingActionResponse,
  RefundSummaryResponse,
  DamageReportResponse,
} from "../../types/bookings";

const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
    request: err?.request,
  });

  let errorMessage = err?.message || "Unknown error";
  if (err?.response) {
    if (typeof err.response.data === "string") {
      if (err.response.data.includes("MulterError: Unexpected field")) {
        errorMessage =
          "Invalid file field names. Please check poster and trailer fields.";
      } else {
        errorMessage = "Server returned an unexpected response";
      }
    } else {
      const responseData: unknown = err.response.data;
      if (typeof responseData === "object" && responseData !== null) {
        const rd = responseData as Record<string, unknown>;
        if (rd.message && typeof rd.message === "string") {
          errorMessage = rd.message;
        } else if (rd.errors) {
          throw rd;
        }
      }
    }
  } else if (err?.request) {
    errorMessage = "No response from server";
  }

  throw new Error(errorMessage);
};

// RawApiVehicle moved to shared types

interface ApiVehiclesResponse {
  ok?: boolean;
  success?: boolean;
  status?: string;
  items: RawApiVehicle[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Station request types (maintenance/deletion)
export interface EvidencePhoto {
  _id: string;
  url: string;
  type?: string;
}

export interface StationRequestItem {
  _id: string;
  vehicle: {
    _id: string;
    plateNumber: string;
    brand: string;
    model: string;
    status: string;
    station?: string | Record<string, unknown>;
  };
  station?: string | Record<string, unknown>;
  reportedBy?: {
    _id: string;
    role?: string;
    name?: string;
    email?: string;
  };
  reportText?: string;
  evidencePhotos?: EvidencePhoto[];
  status: string; // pending | approved | rejected
  previousVehicleStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRequestsResponse {
  success?: boolean;
  ok?: boolean;
  items: StationRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetVehiclesParams {
  station?: string;
  status?: "available" | "reserved" | "rented" | "maintenance";
  brand?: string;
  page?: number;
  limit?: number;
}

// API Functions
export const staffAPI = {
  // Get all vehicles with filters
  getVehicles: async (
    params: GetVehiclesParams = {}
  ): Promise<ApiVehiclesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.station) queryParams.append("station", params.station);
      if (params.status) queryParams.append("status", params.status);
      if (params.brand) queryParams.append("brand", params.brand);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get(`/vehicles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get available vehicles
  getAvailableVehicles: async (params?: {
    station?: string;
    company?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiVehiclesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.station) queryParams.append("station", params.station);
      if (params?.company) queryParams.append("company", params.company);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sort) queryParams.append("sort", params.sort);

      const response = await api.get(
        `/vehicles/available?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get reserved vehicles (booked)
  getReservedVehicles: async (params?: {
    station?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiVehiclesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.station) queryParams.append("station", params.station);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get(
        `/vehicles/reserved?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get rented vehicles
  getRentedVehicles: async (params?: {
    station?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiVehiclesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.station) queryParams.append("station", params.station);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get(
        `/vehicles/rented?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get maintenance requests (for staff: auto-scoped to their station)
  getMaintenanceRequests: async (params?: {
    status?: "approved" | "pending" | "rejected" | string;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedRequestsResponse> => {
    try {
      const response = await api.get("/vehicles/maintenance-requests", {
        params,
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get deletion requests (for staff: auto-scoped to their station)
  getDeletionRequests: async (params?: {
    status?: "approved" | "pending" | "rejected" | string;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedRequestsResponse> => {
    try {
      const response = await api.get("/vehicles/deletion-requests", {
        params,
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update a maintenance request (only creator and when pending)
  updateMaintenanceRequest: async (
    requestId: string,
    payload: {
      description?: string;
      urgency?: "low" | "medium" | "high" | string;
      evidencePhotos?: File[];
    }
  ): Promise<StationRequestItem> => {
    try {
      const form = new FormData();
      if (payload.description) form.append("description", payload.description);
      if (payload.urgency) form.append("urgency", payload.urgency);
      if (payload.evidencePhotos && payload.evidencePhotos.length) {
        payload.evidencePhotos.forEach((f) => form.append("evidencePhotos", f));
      }
      const response = await api.put(
        `/vehicles/maintenance-requests/${requestId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data?.item || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Delete a maintenance request (only creator and when pending)
  deleteMaintenanceRequest: async (
    requestId: string
  ): Promise<{ success: boolean; message?: string; requestId?: string }> => {
    try {
      const response = await api.delete(
        `/vehicles/maintenance-requests/${requestId}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update a deletion request (only creator and when pending)
  updateDeletionRequest: async (
    requestId: string,
    payload: {
      description?: string;
      evidencePhotos?: File[];
    }
  ): Promise<StationRequestItem> => {
    try {
      const form = new FormData();
      if (payload.description) form.append("description", payload.description);
      if (payload.evidencePhotos && payload.evidencePhotos.length) {
        payload.evidencePhotos.forEach((f) => form.append("evidencePhotos", f));
      }
      const response = await api.put(
        `/vehicles/deletion-requests/${requestId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data?.item || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Delete a deletion request (only creator and when pending)
  deleteDeletionRequest: async (
    requestId: string
  ): Promise<{ success: boolean; message?: string; requestId?: string }> => {
    try {
      const response = await api.delete(
        `/vehicles/deletion-requests/${requestId}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Upload contract (Step 3: reserved → reserved)
  uploadContract: async (
    bookingId: string,
    contractFile: File
  ): Promise<BookingActionResponse> => {
    try {
      const formData = new FormData();
      formData.append("contractFile", contractFile);
      const res = await api.post(`/bookings/${bookingId}/contract`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Delete contract
  deleteContract: async (bookingId: string): Promise<BookingActionResponse> => {
    try {
      const res = await api.delete(`/bookings/${bookingId}/contract`);
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Upload pre-rental condition (Step 4: reserved → reserved)
  uploadPreRentalCondition: async (
    bookingId: string,
    payload: {
      batteryLevel: number;
      mileage: number;
      damagePhotos?: File[];
    }
  ): Promise<BookingActionResponse> => {
    try {
      const formData = new FormData();
      formData.append("batteryLevel", String(payload.batteryLevel));
      formData.append("mileage", String(payload.mileage));
      if (payload.damagePhotos?.length) {
        payload.damagePhotos.forEach((file) => {
          formData.append("damagePhotos", file);
        });
      }
      const res = await api.post(
        `/bookings/${bookingId}/pre-rental-condition`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Start booking (Step 5: reserved → active)
  startBooking: async (bookingId: string): Promise<BookingActionResponse> => {
    try {
      const res = await api.post(`/bookings/${bookingId}/start`);
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Mark returned (Step 5: active → returning) - Now requires battery, mileage, damage photos
  markReturned: async (
    bookingId: string,
    payload: {
      batteryLevel: number;
      mileage: number;
      dashboardPhotos?: File[];
    }
  ): Promise<BookingActionResponse> => {
    try {
      const formData = new FormData();
      formData.append("batteryLevel", String(payload.batteryLevel));
      formData.append("mileage", String(payload.mileage));
      if (payload.dashboardPhotos?.length) {
        payload.dashboardPhotos.forEach((file) => {
          formData.append("dashboardPhotos", file);
        });
      }
      const res = await api.put(
        `/bookings/${bookingId}/mark-returned`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get refund summary
  getRefundSummary: async (
    bookingId: string
  ): Promise<RefundSummaryResponse> => {
    try {
      const res = await api.get(`/bookings/${bookingId}/refund-summary`);
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Refund deposit (Step 9: returning → completed if refundAmount > 0)
  refundDeposit: async (
    bookingId: string,
    payload: {
      proofImage?: File;
      notes?: string;
    }
  ): Promise<BookingActionResponse> => {
    try {
      const formData = new FormData();
      if (payload.proofImage) {
        formData.append("proofImage", payload.proofImage);
      }
      if (payload.notes) {
        formData.append("notes", payload.notes);
      }
      const res = await api.post(
        `/bookings/${bookingId}/refund-deposit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Pay additional (Step 9: returning → completed if refundAmount < 0)
  payAdditional: async (
    bookingId: string,
    payload: {
      amount: number;
      proofImage: File;
    }
  ): Promise<BookingActionResponse> => {
    try {
      const formData = new FormData();
      formData.append("amount", String(payload.amount));
      formData.append("proofImage", payload.proofImage);
      const res = await api.post(
        `/bookings/${bookingId}/pay-additional`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Damage report (Step 7: returning → returning)
  damageReport: async (
    bookingId: string,
    payload: {
      description: string;
      estimatedCost?: number;
      photos?: File[];
    }
  ): Promise<DamageReportResponse> => {
    try {
      const formData = new FormData();
      formData.append("description", payload.description);
      if (payload.estimatedCost) {
        formData.append("estimatedCost", String(payload.estimatedCost));
      }
      if (payload.photos?.length) {
        payload.photos.forEach((file) => {
          // Backend expects files under "damagePhotos"
          formData.append("damagePhotos", file);
        });
      }
      const res = await api.post(
        `/bookings/${bookingId}/damage-report`,
        formData
      );
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<RawApiVehicle> => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update vehicle status
  updateVehicleStatus: async (
    id: string,
    status: RawApiVehicle["status"]
  ): Promise<RawApiVehicle> => {
    try {
      const response = await api.patch(`/vehicles/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update vehicle maintenance status
  updateVehicleMaintenance: async (
    id: string,
    maintenanceData: {
      status: "maintenance" | "available";
      maintenanceNotes?: string;
      estimatedCompletionDate?: string;
    }
  ): Promise<RawApiVehicle> => {
    try {
      const response = await api.patch(
        `/vehicles/${id}/maintenance`,
        maintenanceData
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get all contracts with filters
  getContracts: async (params?: {
    status?: string;
    company?: string;
  }): Promise<ContractsListResponse> => {
    try {
      const response = await api.get("/contracts", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get booking transactions (admin) - payment oriented
  getAdminBookingTransactions: async (params?: {
    page?: number;
    limit?: number;
    provider?: string;
    status?: string;
    dateField?: string; // createdAt | updatedAt
    from?: string;
    to?: string;
    sort?: string;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/admin/transactions", {
        params,
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
  // Search bookings (admin/staff)
  searchBookings: async (params?: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/search", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get bookings by status endpoints
  getPendingBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/pending", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getReservedBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/reserved", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getActiveBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/active", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getCancelledBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/cancelled", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getRejectedBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/rejected", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getCompletedBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/completed", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getExpiredBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/bookings/expired", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Manual refund candidates (staff/admin)
  getManualRefundCandidates: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/manual-refunds/candidates", {
        params,
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Manual refunds list (processed)
  getManualRefunds: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<AdminBookingTransactionsResponse> => {
    try {
      const response = await api.get("/manual-refunds", { params });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Create manual refund request (staff/admin)
  createManualRefund: async (payload: {
    booking: string;
    amount: number;
    reason?: string;
    attachments?: File[];
  }): Promise<any> => {
    try {
      const form = new FormData();
      form.append("booking", payload.booking);
      form.append("amount", String(payload.amount));
      if (payload.reason) form.append("reason", payload.reason);
      if (payload.attachments?.length) {
        payload.attachments.forEach((f) => form.append("attachments", f));
      }
      const response = await api.post("/manual-refunds", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update manual refund request (status/note/add files)
  updateManualRefund: async (
    id: string,
    payload: {
      status?: string;
      note?: string;
      addFiles?: File[];
    }
  ): Promise<any> => {
    try {
      const form = new FormData();
      if (payload.status) form.append("status", payload.status);
      if (payload.note) form.append("note", payload.note);
      if (payload.addFiles?.length) {
        payload.addFiles.forEach((f) => form.append("addFiles", f));
      }
      const response = await api.patch(`/manual-refunds/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Create a booking
  createBooking: async (
    payload: CreateBookingRequest
  ): Promise<CreateBookingResponse> => {
    try {
      const response = await api.post("/bookings", payload);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get renters only (for staff) - using search endpoint
  getRenters: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();

      // Add search query if provided
      if (params?.search && params.search.trim()) {
        queryParams.append("q", params.search.trim());
      }

      // Always add pagination and sort
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      queryParams.append("sort", "-createdAt");

      const response = await api.get(
        `/users/renters?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Verify user KYC (approve)
  verifyKYC: async (userId: string) => {
    try {
      const response = await api.patch(`/users/${userId}/kyc/verify`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Unverify user KYC (reject)
  unverifyKYC: async (userId: string) => {
    try {
      const response = await api.patch(`/api/users/${userId}/kyc/unverify`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

export default staffAPI;

// Export selected local types
export type { ApiVehiclesResponse, GetVehiclesParams };

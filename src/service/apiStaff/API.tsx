// src/services/API.jsx
import { AxiosError } from "axios";

import api from "../Utils";

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

// Vehicle Types - Raw API response structure
interface RawApiVehicle {
  _id: string;
  owner: string;
  company?: string | null;
  valuation?: {
    valueVND: number;
    lastUpdatedAt?: string;
  };
  plateNumber: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  status: "available" | "rented" | "maintenance";
  station: {
    _id: string;
    name: string;
    code: string;
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    isActive: boolean;
  };
  defaultPhotos: {
    exterior: string[];
    interior: string[];
  };
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  maintenanceHistory: Array<{
    description: string;
    reportedAt: string;
    staff: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ApiVehiclesResponse {
  success: boolean;
  data: RawApiVehicle[];
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

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<RawApiVehicle> => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      // If response has a 'data' wrapper, unwrap it
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
};

export default staffAPI;

// Export types for use in components
export type { RawApiVehicle, ApiVehiclesResponse, GetVehiclesParams };

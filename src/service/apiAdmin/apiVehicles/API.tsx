// service/apiVehicles/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";

// ✅ Photo interface
export interface VehiclePhoto {
  _id: string;
  url: string;
  type: "image";
}

// ✅ Station interface đầy đủ (khi populated)
export interface StationData {
  _id: string;
  name: string;
  code: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

// ✅ Simple Station interface (for compatibility)
export interface Station {
  _id: string;
  name: string;
  code: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

// ✅ Vehicle interface đầy đủ theo response thực tế
export interface Vehicle {
  _id: string;

  // Owner & Company
  owner: "internal" | "company";
  company: string | null;

  // Valuation
  valuation: {
    valueVND: number;
    lastUpdatedAt?: string;
  };

  // Basic info
  plateNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color: string;

  // Technical specs
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;

  // Status
  status: "available" | "reserved" | "rented" | "maintenance";

  // Station - có thể là string (ObjectId) hoặc object (populated)
  station: string | StationData;

  // Photos
  defaultPhotos: {
    exterior: VehiclePhoto[];
    interior: VehiclePhoto[];
  };

  // Ratings
  ratingAvg?: number;
  ratingCount?: number;

  // Tags & Maintenance
  tags: string[];
  maintenanceHistory: any[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Additional fields for UI compatibility
  image?: string;
  stationData?: StationData;
  batteryLevel?: number;
}

// ✅ API Response format - sửa từ data sang items

export interface TransferLog {
  _id: string;
  vehicleId: string;
  fromStationId: string;
  toStationId: string;
  transferredBy: string;
  transferDate: string;
  reason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  plateNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  status: "available" | "reserved" | "rented" | "maintenance";
  station: string;
  defaultPhotos?: {
    exterior: string[];
    interior: string[];
  };
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

export interface TransferStationData {
  toStationId: string;
  reason?: string;
}

// ✅ Paginated response interface
export interface PaginatedResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
}

// ✅ Error handler
const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("Vehicle API Error:", {
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

// ✅ Helper function to get station ID
export const getStationId = (station: Station | string): string => {
  return typeof station === 'string' ? station : station._id;
};

// ✅ Helper function to get station name
export const getStationName = (station: Station | string | undefined): string => {
  if (!station) return "Unknown";
  if (typeof station === 'string') return station;
  return station.name || "Unknown";
};

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get<PaginatedResponse<Vehicle> | Vehicle[]>(
      "/vehicles?populate=station"
    );

    console.log("🔍 API Response:", response.data);

    // Handle paginated response format: { success, page, limit, total, totalPages, items }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "items" in response.data
    ) {
      const paginatedResponse = response.data as PaginatedResponse<Vehicle>;
      if (paginatedResponse.success && Array.isArray(paginatedResponse.items)) {
        console.log(
          "✅ Paginated response - Total:",
          paginatedResponse.total,
          "Items:",
          paginatedResponse.items.length
        );
        return paginatedResponse.items;
      }
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      console.log("✅ Response is directly an array:", response.data.length);
      return response.data;
    }

    // Fallback for old format with 'data' property
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      console.log("✅ Response has data array");
      return (response.data as any).data;
    }

    console.error("❌ Unexpected response format:", response.data);
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("❌ Error in getAllVehicles:", error);
    handleError(error);
    throw error;
  }
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  try {
    const response = await api.get<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}?populate=stationData`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Vehicle not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createVehicle = async (
  vehicleData: CreateVehicleData
): Promise<Vehicle> => {
  try {
    const response = await api.post<{ success: boolean; data: Vehicle }>(
      "/vehicles",
      vehicleData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Failed to create vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateVehicle = async (
  id: string,
  vehicleData: UpdateVehicleData
): Promise<Vehicle> => {
  try {
    const response = await api.put<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}`,
      vehicleData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Failed to update vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vehicles/${id}`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const transferVehicleStation = async (
  id: string,
  transferData: TransferStationData
): Promise<Vehicle> => {
  try {
    const response = await api.post<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}/transfer-station`,
      transferData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Failed to transfer vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getAllTransferLogs = async (): Promise<TransferLog[]> => {
  try {
    const response = await api.get<{ success: boolean; data: TransferLog[] }>(
      "/vehicles/transfer-logs"
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const uploadVehiclePhotos = async (photos: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append(`photos`, photo);
    });

    const response = await api.post<{ success: boolean; data: string[] }>(
      "/vehicles/upload-photos",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    throw new Error("Failed to upload photos");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Vehicle Management Request Functions
export const reportMaintenance = async (
  id: string,
  body: { description: string }
): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/${id}/report-maintenance`,
      body
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to report maintenance");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createDeletionRequest = async (
  id: string,
  body: { reason: string }
): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/${id}/deletion-requests`,
      body
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to create deletion request");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Deletion Requests Management
export const getDeletionRequests = async (): Promise<any[]> => {
  try {
    const response = await api.get<{ success: boolean; data: any[] }>(
      "/vehicles/deletion-requests"
    );
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const approveDeletionRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/deletion-requests/${requestId}/approve`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to approve deletion request");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const rejectDeletionRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/deletion-requests/${requestId}/reject`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to reject deletion request");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Maintenance Requests Management
export const getMaintenanceRequests = async (): Promise<any[]> => {
  try {
    const response = await api.get<{ success: boolean; data: any[] }>(
      "/vehicles/maintenance-requests"
    );
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const approveMaintenanceRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/maintenance-requests/${requestId}/approve`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to approve maintenance request");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const rejectMaintenanceRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await api.post<{ success: boolean; data: any }>(
      `/vehicles/maintenance-requests/${requestId}/reject`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to reject maintenance request");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

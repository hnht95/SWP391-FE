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
}

// ✅ API Response format - sửa từ data sang items
interface VehicleApiResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Vehicle[]; // ✅ Backend trả về items[] chứ không phải data[]
}

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
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  status: string;
  station: string;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

export interface TransferStationData {
  toStationId: string;
  reason?: string;
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

// ✅ Sửa từ response.data.data sang response.data.items
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get<VehicleApiResponse>("/vehicles");

    console.log("API Response:", response.data);

    // ✅ Backend trả về items[] thay vì data[]
    if (response.data.success && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  try {
    const response = await api.get<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}`
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

export const getVehicleTransferLogs = async (
  vehicleId: string
): Promise<TransferLog[]> => {
  try {
    const response = await api.get<{ success: boolean; data: TransferLog[] }>(
      `/vehicles/${vehicleId}/transfer-logs`
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

// service/apiVehicles/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";

// ✅ Photo interface
export interface VehiclePhoto {
  _id: string;
  url: string;
  type: "image";
}

// ✅ Station interface
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

// ✅ Vehicle interface
export interface Vehicle {
  _id: string;
  owner: "internal" | "company";
  company: string | null;
  valuation: {
    valueVND: number;
    lastUpdatedAt?: string;
  };
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
  station: string | StationData;
  defaultPhotos: {
    exterior: VehiclePhoto[];
    interior: VehiclePhoto[];
  };
  ratingAvg?: number;
  ratingCount?: number;
  tags: string[];
  maintenanceHistory: any[];
  createdAt?: string;
  updatedAt?: string;
}

// ✅ API Response formats
interface VehicleApiResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Vehicle[];
}

interface SingleVehicleResponse {
  success: boolean;
  data: Vehicle;
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

/**
 * GET /api/vehicles
 * Response formats:
 * 1. Array trực tiếp: Vehicle[]
 * 2. Wrapped: { success: true, items: Vehicle[] }
 * 3. Paginated: { success: true, page, limit, total, totalPages, items }
 */
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get("/vehicles");

    console.log("✅ API Response:", response.data);

    // ✅ Case 1: Direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // ✅ Case 2: Wrapped in success/items
    if (response.data.success && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    // ✅ Case 3: Wrapped in success/data
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // ✅ Case 4: Just items array
    if (Array.isArray(response.data.items)) {
      return response.data.items;
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/vehicles/:id
 */
export const getVehicleById = async (id: string): Promise<Vehicle> => {
  try {
    const response = await api.get<SingleVehicleResponse>(`/vehicles/${id}`);

    console.log("✅ API Response:", response.data);

    // ✅ Case 1: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // ✅ Case 2: Direct vehicle object
    if (response.data._id) {
      return response.data as any;
    }

    throw new Error("Vehicle not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/vehicles
 */
export const createVehicle = async (
  vehicleData: CreateVehicleData
): Promise<Vehicle> => {
  try {
    const response = await api.post<SingleVehicleResponse>(
      "/vehicles",
      vehicleData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    if (response.data._id) {
      return response.data as any;
    }

    throw new Error("Failed to create vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * PUT /api/vehicles/:id
 */
export const updateVehicle = async (
  id: string,
  vehicleData: UpdateVehicleData
): Promise<Vehicle> => {
  try {
    const response = await api.put<SingleVehicleResponse>(
      `/vehicles/${id}`,
      vehicleData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    if (response.data._id) {
      return response.data as any;
    }

    throw new Error("Failed to update vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vehicles/${id}`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/vehicles/:id/transfer-station
 */
export const transferVehicleStation = async (
  id: string,
  transferData: TransferStationData
): Promise<Vehicle> => {
  try {
    const response = await api.post<SingleVehicleResponse>(
      `/vehicles/${id}/transfer-station`,
      transferData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    if (response.data._id) {
      return response.data as any;
    }

    throw new Error("Failed to transfer vehicle");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/vehicles/transfer-logs
 */
export const getAllTransferLogs = async (): Promise<TransferLog[]> => {
  try {
    const response = await api.get("/vehicles/transfer-logs");

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/vehicles/:vehicleId/transfer-logs
 */
export const getVehicleTransferLogs = async (
  vehicleId: string
): Promise<TransferLog[]> => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/transfer-logs`);

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    handleError(error);
    throw error;
  }
};

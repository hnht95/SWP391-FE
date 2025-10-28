import { AxiosError } from "axios";
import api from "../../Utils";

// ✅ Station Interface
export interface Station {
  _id: string;
  name: string;
  code?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  imgStation?: string;
  note?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ API Response Wrapper (for list endpoints)
interface StationListResponse {
  success: boolean;
  data: Station[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ API Response Wrapper (for single station)
interface StationResponse {
  success: boolean;
  data: Station;
}

// ✅ Create Station Data - Flat structure
export interface CreateStationData {
  name: string;
  code?: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
  isActive?: boolean;
}

// ✅ Update Station Data
export interface UpdateStationData extends Partial<CreateStationData> {}

// ✅ Error Handler
const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("Station API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
  });

  let errorMessage = err?.message || "Unknown error";
  if (err?.response?.data) {
    const responseData: any = err.response.data;
    if (responseData.error) {
      errorMessage = responseData.error;
    } else if (responseData.message) {
      errorMessage = responseData.message;
    }
  }

  throw new Error(errorMessage);
};

export const getAllStations = async (
  page: number = 1,
  limit: number = 20
): Promise<Station[]> => {
  try {
    const response = await api.get<StationListResponse>("/stations", {
      params: { page, limit },
    });

    // ✅ Check for wrapped response
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // ✅ Fallback: if backend returns array directly (no wrapper)
    if (Array.isArray(response.data)) {
      return response.data as unknown as Station[];
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/stations/:id
 * Backend returns: { success: true, data: Station }
 */
export const getStationById = async (id: string): Promise<Station> => {
  try {
    const response = await api.get<StationResponse>(`/stations/${id}`);

    console.log("Get station response:", response.data);

    // ✅ Check for wrapped response
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // ✅ Fallback: if backend returns station directly
    if (response.data.data._id) {
      return response.data as unknown as Station;
    }

    throw new Error("Station not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/stations
 * Backend expects: { name, code?, address, lat, lng, note? }
 * Backend returns: Station (created station directly)
 */
export const createStation = async (
  stationData: CreateStationData
): Promise<Station> => {
  try {
    console.log("Creating station with data:", stationData);

    const response = await api.post<Station>("/stations", stationData);

    console.log("Create station response:", response.data);

    // ✅ Backend returns station directly (no wrapper for POST)
    if (response.data && response.data._id) {
      return response.data;
    }

    throw new Error("Failed to create station");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * PUT /api/stations/:id
 * Backend expects: { name?, code?, address?, lat?, lng?, note? }
 * Backend returns: { success: true, data: Station }
 */
export const updateStation = async (
  id: string,
  stationData: UpdateStationData
): Promise<Station> => {
  try {
    console.log("Updating station:", id, stationData);

    const response = await api.put<StationResponse>(
      `/stations/${id}`,
      stationData
    );

    console.log("Update station response:", response.data);

    // ✅ Check for wrapped response
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // ✅ Fallback: if backend returns station directly
    if (response.data.data._id) {
      return response.data.data;
    }

    throw new Error("Failed to update station");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * DELETE /api/stations/:id
 * Backend expects: { transferToStationId?, reason? } in body
 * Backend returns: { message: "Station deleted successfully" }
 */
export interface DeleteStationResponse {
  success?: boolean;
  deletedStationId?: string;
  movedVehiclesCount?: number;
  message?: string;
}

export const deleteStation = async (
  id: string,
  transferToStationId?: string,
  reason?: string
): Promise<DeleteStationResponse> => {
  try {
    const payload: any = {};
    if (transferToStationId) payload.transferToStationId = transferToStationId;
    if (reason) payload.reason = reason;

    const response = await api.delete(`/stations/${id}`, {
      data: payload,
    });

    const data = response.data as DeleteStationResponse | { message: string };
    console.log("Delete response:", data);

    // Chuẩn hóa response: hỗ trợ cả 2 format backend cung cấp
    if ("success" in (data as any) || "deletedStationId" in (data as any)) {
      return data as DeleteStationResponse;
    }
    if ((data as any).message) {
      return { message: (data as any).message };
    }
    return {};
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ============================================
// ✅ HELPER FUNCTIONS
// ============================================

/**
 * Get active stations only
 */
export const getActiveStations = async (): Promise<Station[]> => {
  try {
    const allStations = await getAllStations();
    return allStations.filter((station) => station.isActive === true);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Search stations by name or address
 */
export const searchStations = async (
  searchTerm: string
): Promise<Station[]> => {
  try {
    const allStations = await getAllStations();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return allStations.filter(
      (station) =>
        station.name.toLowerCase().includes(lowerSearchTerm) ||
        station.location.address.toLowerCase().includes(lowerSearchTerm) ||
        station.code?.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Get station by code
 */
export const getStationByCode = async (
  code: string
): Promise<Station | null> => {
  try {
    const allStations = await getAllStations();
    return allStations.find((station) => station.code === code) || null;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

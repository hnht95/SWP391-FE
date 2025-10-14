import { AxiosError } from "axios";
import api from "../Utils";

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

// ✅ Create Station Data - Flat structure
export interface CreateStationData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
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

// ============================================
// ✅ STATION CRUD OPERATIONS
// ============================================

/**
 * GET /api/stations?page=1&limit=20
 * Backend returns: Station[] (array directly, no wrapper)
 */
export const getAllStations = async (): Promise<Station[]> => {
  try {
    // Backend returns array directly
    const response = await api.get<Station[]>("/stations");

    console.log("API Response:", response.data);

    // ✅ Backend returns array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * GET /api/stations/:id
 * Backend returns: Station (object directly, no wrapper)
 */
export const getStationById = async (id: string): Promise<Station> => {
  try {
    const response = await api.get<Station>(`/stations/${id}`);

    console.log("Get station response:", response.data);

    // ✅ Backend returns station directly
    if (response.data && response.data._id) {
      return response.data;
    }

    throw new Error("Station not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST /api/stations
 * Backend expects: { name, address, lat, lng, note }
 * Backend returns: Station (created station directly)
 */
export const createStation = async (
  stationData: CreateStationData
): Promise<Station> => {
  try {
    console.log("Creating station with data:", stationData);

    const response = await api.post<Station>("/stations", stationData);

    console.log("Create station response:", response.data);

    // ✅ Backend returns station directly
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
 * Backend expects: { name, address, lat, lng, note }
 * Backend returns: Station (updated station directly)
 */
export const updateStation = async (
  id: string,
  stationData: UpdateStationData
): Promise<Station> => {
  try {
    console.log("Updating station:", id, stationData);

    const response = await api.put<Station>(`/stations/${id}`, stationData);

    console.log("Update station response:", response.data);

    // ✅ Backend returns station directly
    if (response.data && response.data._id) {
      return response.data;
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
 * Backend returns: { success: true, message?, deletedStation? }
 */
export const deleteStation = async (
  id: string,
  transferToStationId?: string,
  reason?: string
): Promise<void> => {
  try {
    const payload: any = {};
    if (transferToStationId) payload.transferToStationId = transferToStationId;
    if (reason) payload.reason = reason;

    const response = await api.delete(`/stations/${id}`, {
      data: payload,
    });

    console.log("Delete response:", response.data);
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

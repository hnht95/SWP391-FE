import api from "../Utils";

export interface StationLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface StationItem {
  id: string;
  name: string;
  code: string;
  location?: StationLocation;
  note?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backend may return either a plain array or an object with data + pagination
interface PlainStationRecord {
  _id: string;
  name?: string;
  code?: string;
  location?: StationLocation;
  note?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WrappedStationsResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    code: string;
    location?: StationLocation;
    note?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function normalizeStation(record: PlainStationRecord): StationItem {
  return {
    id: record._id,
    name: record.name ?? "",
    code: record.code ?? "",
    location: record.location,
    note: record.note ?? null,
    isActive: Boolean(record.isActive),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function normalizeWrappedStation(record: WrappedStationsResponse["data"][number]): StationItem {
  return {
    id: record.id,
    name: record.name,
    code: record.code,
    location: record.location,
    note: record.note ?? null,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export interface CreateStationInput {
  name: string;
  code: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  note?: string;
  isActive: boolean;
}

export const stationManagementAPI = {
  async list(page?: number, limit?: number): Promise<StationItem[]> {
    const res = await api.get("/stations", {
      params: {
        page,
        limit,
      },
    });
    const payload = res.data as PlainStationRecord[] | WrappedStationsResponse;

    if (Array.isArray(payload)) {
      const items = payload
        .filter((s): s is PlainStationRecord => Boolean(s && (s._id || s.isActive !== undefined)))
        .map(normalizeStation)
        .filter((s) => Boolean(s.name) && Boolean(s.code));
      return items;
    }

    if (payload && Array.isArray(payload.data)) {
      const items = payload.data
        .map(normalizeWrappedStation)
        .filter((s) => Boolean(s.name) && Boolean(s.code));
      return items;
    }

    return [];
  },

  async create(data: CreateStationInput): Promise<StationItem> {
    const res = await api.post("/stations", data);
    return res.data;
  },

  async delete(stationId: string): Promise<{ message: string }> {
    const res = await api.delete(`/stations/${stationId}`);
    return res.data;
  },
};

export default stationManagementAPI;



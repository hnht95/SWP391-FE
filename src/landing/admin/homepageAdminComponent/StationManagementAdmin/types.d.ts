// Station Management Types

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Station {
  id: string;
  _id?: string; // MongoDB ID if exists
  name: string;
  code: string;
  location: Location;
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Mock fields for display (if not from API)
  vehicleCount?: number;
  availableCount?: number;
  maintenanceCount?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface StationListResponse {
  data: {
    items: Station[];
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  message: string;
  status: number;
}

export interface CreateStationPayload {
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  note?: string;
  isActive: boolean;
}

export interface UpdateStationPayload extends Partial<CreateStationPayload> {
  id: string;
}

export interface StationFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page: number;
  limit: number;
}


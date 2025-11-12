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
  status: "available" | "reserved" | "rented" | "maintenance" | "pending_deletion" | "pending_maintenance";
  station: string | StationData;
  defaultPhotos: {
    exterior: (string | VehiclePhoto)[];
    interior: (string | VehiclePhoto)[];
  };
  ratingAvg?: number;
  ratingCount?: number;
  tags: string[];
  maintenanceHistory: any[];
  createdAt?: string;
  updatedAt?: string;

  // Additional fields for UI compatibility
  image?: string;
  stationData?: StationData;
  batteryLevel?: number;
  isPartnerVehicle?: boolean;  // From backend response
}

// ✅ API Response formats
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
  valuation?: {
    valueVND: number;
  };
  // For FormData upload
  exteriorFiles?: File[];
  interiorFiles?: File[];
  // For JSON with photo IDs
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

/**
 * Utility function to convert photo IDs or objects to URLs
 * Handles both string IDs and VehiclePhoto objects
 */
export const getPhotoUrls = (photos: (string | VehiclePhoto)[]): string[] => {
  if (!photos || !Array.isArray(photos)) return [];
  
  return photos.map((photo) => {
    // If it's a string, assume it's a photo ID
    if (typeof photo === 'string') {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://be-ev-rental-system-production.up.railway.app';
      return `${baseURL}/uploads/${photo}`;
    }
    
    // If it's an object with url property
    if (photo && typeof photo === 'object' && photo.url) {
      return photo.url;
    }
    
    // If it's an object with _id, construct URL
    if (photo && typeof photo === 'object' && photo._id) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://be-ev-rental-system-production.up.railway.app';
      return `${baseURL}/uploads/${photo._id}`;
    }
    
    return '';
  }).filter(url => url !== '');
};

/**
 * Utility function to extract station ID from vehicle station data
 * Handles both string IDs and StationData objects
 */
export const getStationId = (station: string | StationData | undefined): string => {
  if (!station) return '';
  
  // If it's a string, return it directly
  if (typeof station === 'string') {
    return station;
  }
  
  // If it's an object with _id, return the _id
  if (station && typeof station === 'object' && station._id) {
    return station._id;
  }
  
  return '';
};

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
    console.error("❌ Error in getAllVehicles:", error);
    handleError(error);
    throw error;
  }
};

// Paginated vehicles list
export interface VehiclesPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getVehiclesPaginated = async (
  page = 1,
  limit = 20
): Promise<{ items: Vehicle[]; pagination: VehiclesPaginationMeta }> => {
  try {
    const response = await api.get<{ success?: boolean; items?: Vehicle[]; data?: Vehicle[]; page?: number; limit?: number; total?: number; totalPages?: number; pagination?: VehiclesPaginationMeta }>(
      "/vehicles",
      { params: { page, limit } }
    );

    // Swagger style: { success, items, pagination }
    if (Array.isArray(response.data?.items)) {
      return {
        items: response.data.items,
        pagination: response.data.pagination || {
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total: response.data.total || response.data.items.length,
          totalPages: response.data.totalPages || 1,
        },
      };
    }

    // Alternative: { success, data, page, limit, total, totalPages }
    if (Array.isArray(response.data?.data)) {
      return {
        items: response.data.data,
        pagination: {
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total: response.data.total || response.data.data.length,
          totalPages: response.data.totalPages || 1,
        },
      };
    }

    // Fallback direct array
    if (Array.isArray(response.data)) {
      const items = response.data as unknown as Vehicle[];
      return {
        items,
        pagination: { page, limit, total: items.length, totalPages: 1 },
      };
    }

    return { items: [], pagination: { page, limit, total: 0, totalPages: 1 } };
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
    if ((response.data as any)._id) {
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
    // Check if we need to send as FormData (has files)
    const hasFiles = vehicleData.exteriorFiles?.length || vehicleData.interiorFiles?.length;
    
    let payload: any;
    let headers: any = {};
    
    if (hasFiles) {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all text fields
      if (vehicleData.plateNumber) formData.append('plateNumber', vehicleData.plateNumber);
      if (vehicleData.brand) formData.append('brand', vehicleData.brand);
      if (vehicleData.model) formData.append('model', vehicleData.model);
      if (vehicleData.year) formData.append('year', vehicleData.year.toString());
      if (vehicleData.color) formData.append('color', vehicleData.color);
      if (vehicleData.batteryCapacity) formData.append('batteryCapacity', vehicleData.batteryCapacity.toString());
      if (vehicleData.mileage) formData.append('mileage', vehicleData.mileage.toString());
      if (vehicleData.pricePerDay) formData.append('pricePerDay', vehicleData.pricePerDay.toString());
      if (vehicleData.pricePerHour) formData.append('pricePerHour', vehicleData.pricePerHour.toString());
      if (vehicleData.status) formData.append('status', vehicleData.status);
      if (vehicleData.station) formData.append('station', vehicleData.station);
      // Send valuation - backend should parse JSON string from FormData
      if (vehicleData.valuation && vehicleData.valuation.valueVND !== undefined) {
        formData.append('valuation', JSON.stringify(vehicleData.valuation));
      }
      
      // Append files
      if (vehicleData.exteriorFiles) {
        vehicleData.exteriorFiles.forEach((file) => {
          formData.append('exteriorFiles', file);
        });
      }
      if (vehicleData.interiorFiles) {
        vehicleData.interiorFiles.forEach((file) => {
          formData.append('interiorFiles', file);
        });
      }
      
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      // Send as JSON if no files
      payload = vehicleData;
    }
    
    const response = await api.post<SingleVehicleResponse>(
      "/vehicles",
      payload,
      hasFiles ? { headers } : undefined
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    if ((response.data as any)._id) {
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
    console.log("🔄 Updating vehicle with data:", vehicleData);
    
    // Separate files and photos from other data to avoid backend transaction requirements
    const { exteriorFiles, interiorFiles, defaultPhotos, ...restData } = vehicleData as any;
    
    // Normalize station to ID string if object provided
    let normalizedStation: string | undefined = undefined;
    if (typeof restData.station !== 'undefined') {
      normalizedStation = getStationId(restData.station);
    }
    
    const basePayload: any = { ...restData };
    if (typeof normalizedStation !== 'undefined' && normalizedStation) {
      basePayload.station = normalizedStation;
    } else if (typeof restData.station !== 'undefined') {
      // Explicitly remove station if it's an object and no id resolved
      delete basePayload.station;
    }
    
    // Never send defaultPhotos in the main update; handled by separate upload step
    if (typeof basePayload.defaultPhotos !== 'undefined') delete basePayload.defaultPhotos;
    
    // Remove undefined fields to prevent schema validation noise
    Object.keys(basePayload).forEach((k) => {
      if (typeof basePayload[k] === 'undefined' || basePayload[k] === null) {
        delete basePayload[k];
      }
    });
    
    // First, update vehicle data without files
    console.log("📡 Step 1: Updating vehicle basic info...");
    
    let response: { data: any };
    try {
      response = await api.put<SingleVehicleResponse>(
        `/vehicles/${id}`,
        basePayload
      );
    } catch (err: any) {
      const msg = (err?.response?.data?.message || err?.message || '').toString();
      const needRetry = /action|type|source/i.test(msg);
      if (!needRetry) {
        throw err;
      }
      // Retry once with ultra-minimal payload to avoid transaction plugin requirements
      const minimalPayload: any = {
        plateNumber: basePayload.plateNumber,
        brand: basePayload.brand,
        model: basePayload.model,
        year: basePayload.year,
        color: basePayload.color,
        batteryCapacity: basePayload.batteryCapacity,
        mileage: basePayload.mileage,
        pricePerDay: basePayload.pricePerDay,
        pricePerHour: basePayload.pricePerHour,
        status: basePayload.status,
      };
      if (basePayload.station) minimalPayload.station = basePayload.station;
      response = await api.put<SingleVehicleResponse>(`/vehicles/${id}`, minimalPayload);
    }

    console.log("✅ Update response:", response.data);

    let updatedVehicle: Vehicle;
    if (response.data.success && response.data.data) {
      updatedVehicle = response.data.data;
    } else if ((response.data as any)._id) {
      updatedVehicle = response.data as any;
    } else {
      throw new Error("Failed to update vehicle");
    }
    
    // If there are new files to upload, do it in a separate request
    const hasNewFiles = exteriorFiles?.length || interiorFiles?.length;
    
    if (hasNewFiles) {
      console.log("📤 Step 2: Uploading new photos...");
      console.log("New files:", {
        exterior: exteriorFiles?.length || 0,
        interior: interiorFiles?.length || 0
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append files
      if (exteriorFiles) {
        exteriorFiles.forEach((file: File) => {
          formData.append('exteriorFiles', file);
        });
      }
      if (interiorFiles) {
        interiorFiles.forEach((file: File) => {
          formData.append('interiorFiles', file);
        });
      }
      
      // Send files to update photos with mode as query parameter
      const photosResponse = await api.put<SingleVehicleResponse>(
        `/vehicles/${id}?mode=append`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      console.log("✅ Photos upload response:", photosResponse.data);
      console.log("📸 Photos in response:", {
        exterior: photosResponse.data.data?.defaultPhotos?.exterior?.length || 0,
        interior: photosResponse.data.data?.defaultPhotos?.interior?.length || 0,
        hasData: !!photosResponse.data.data,
        fullData: photosResponse.data.data?.defaultPhotos
      });
      
      // Always fetch the vehicle again to get the most up-to-date data including photos
      if (photosResponse.data.success) {
        console.log("🔄 Fetching updated vehicle data to get photos...");
        
        // Wait a bit for backend to process files (1 second delay)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedVehicleWithPhotos = await getVehicleById(id);
        
        console.log("✅ Updated vehicle with photos:", {
          exterior: updatedVehicleWithPhotos.defaultPhotos?.exterior?.length || 0,
          interior: updatedVehicleWithPhotos.defaultPhotos?.interior?.length || 0
        });
        
        return updatedVehicleWithPhotos;
      }
    }
    
    return updatedVehicle;
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

    if ((response.data as any)._id) {
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
    const response = await api.get<{ success: boolean; data?: any[]; items?: any[]; pagination?: any }>(
      "/vehicles/deletion-requests"
    );
    
    // Swagger variant: { success, items: [], pagination }
    if (response.data && response.data.success && Array.isArray(response.data.items)) {
      return response.data.items as any[];
    }

    // Older variant: { success, data: [] }
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

// Paginated variant helper for deletion requests
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getDeletionRequestsPaginated = async (
  page = 1,
  limit = 20
): Promise<{ items: any[]; pagination: PaginationMeta }> => {
  try {
    const response = await api.get<{ success?: boolean; items?: any[]; data?: any[]; pagination?: PaginationMeta }>(
      "/vehicles/deletion-requests",
      { params: { page, limit } }
    );

    // Prefer Swagger shape: { success, items, pagination }
    if (Array.isArray(response.data?.items)) {
      return {
        items: response.data.items || [],
        pagination: response.data.pagination || { page, limit, total: response.data.items?.length || 0, totalPages: 1 },
      };
    }

    // Fallback: { success, data }
    if (Array.isArray(response.data?.data)) {
      const items = response.data.data || [];
      return {
        items,
        pagination: { page, limit, total: items.length, totalPages: 1 },
      };
    }

    // Fallback: array only
    if (Array.isArray(response.data)) {
      const items = response.data as any[];
      return {
        items,
        pagination: { page, limit, total: items.length, totalPages: 1 },
      };
    }

    return { items: [], pagination: { page, limit, total: 0, totalPages: 1 } };
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

// Paginated maintenance requests (admin)
export const getMaintenanceRequestsPaginated = async (
  page = 1,
  limit = 20
): Promise<{ items: any[]; pagination: PaginationMeta }> => {
  try {
    const response = await api.get<{ success?: boolean; items?: any[]; data?: any[]; pagination?: PaginationMeta }>(
      "/vehicles/maintenance-requests",
      { params: { page, limit } }
    );

    if (Array.isArray(response.data?.items)) {
      return {
        items: response.data.items || [],
        pagination: response.data.pagination || { page, limit, total: response.data.items?.length || 0, totalPages: 1 },
      };
    }

    if (Array.isArray(response.data?.data)) {
      const items = response.data.data || [];
      return {
        items,
        pagination: { page, limit, total: items.length, totalPages: 1 },
      };
    }

    if (Array.isArray((response as any).data)) {
      const items = (response as any).data as any[];
      return { items, pagination: { page, limit, total: items.length, totalPages: 1 } };
    }

    return { items: [], pagination: { page, limit, total: 0, totalPages: 1 } };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

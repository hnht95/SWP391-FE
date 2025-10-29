// service/apiAdmin/apiListUser/API.tsx
import { AxiosError } from "axios";
import api from "../../Utils";
import type { RawApiUser } from "../../../types/userTypes";

// ✅ User query filters
export interface UserListFilters {
  role?: "admin" | "staff" | "renter" | "partner";
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ✅ Paginated response interface
export interface UserListResponse {
  ok?: boolean; // Backend uses "ok" field
  success?: boolean; // Some endpoints might use "success"
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  items: RawApiUser[];
}

// ✅ Error handler
const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("User List API Error:", {
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

// ✅ Get all users with filters and pagination
export const getAllUsers = async (
  filters: UserListFilters = {}
): Promise<UserListResponse> => {
  try {
    const params: Record<string, any> = {};
    
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    console.log("🔍 Fetching users with filters:", params);

    const response = await api.get("/admin/users", { params });

    console.log("✅ Users response:", response.data);

    // Handle different response formats
    const data = response.data;

    // Case 1: Response has "ok" field (actual backend format from Swagger)
    if (data && typeof data === 'object' && 'ok' in data && data.ok === true && 'items' in data) {
      console.log("✅ Matched format: { ok: true, items: [...] }");
      return {
        ok: true,
        success: true,
        page: (data.page as number) || 1,
        limit: (data.limit as number) || 20,
        total: (data.total as number) || 0,
        totalPages: (data.totalPages as number) || 1,
        items: data.items as RawApiUser[],
      };
    }

    // Case 2: Response has "success" field
    if (data && typeof data === 'object' && 'success' in data && data.success && 'items' in data) {
      console.log("✅ Matched format: { success: true, items: [...] }");
      return data as UserListResponse;
    }

    // Case 3: Response is a paginated object but items might be in 'data' field
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      console.log("✅ Matched format: { success: true, data: [...] }");
      return {
        success: true,
        ok: true,
        page: (data.page as number) || 1,
        limit: (data.limit as number) || 20,
        total: (data.total as number) || data.data.length,
        totalPages: (data.totalPages as number) || 1,
        items: data.data as RawApiUser[],
      };
    }

    // Case 4: Response is directly an array
    if (Array.isArray(data)) {
      console.log("✅ Matched format: Array directly");
      return {
        ok: true,
        success: true,
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
        items: data as RawApiUser[],
      };
    }

    console.error("❌ Unexpected response format:", data);
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    handleError(error);
    throw error;
  }
};

// ✅ Get renters (swagger: GET /api/users/renters)
export interface GetRentersFilters {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
}

export interface GetRentersResponse {
  success?: boolean;
  ok?: boolean;
  items: RawApiUser[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

export const getRenters = async (
  filters: GetRentersFilters = {}
): Promise<GetRentersResponse> => {
  try {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.q) params.q = filters.q;
    if (typeof filters.isActive === "boolean") params.isActive = filters.isActive;

    const response = await api.get("/users/renters", { params });
    const data = response.data;

    if (data && typeof data === "object" && Array.isArray(data.items)) {
      return {
        success: Boolean(data.success ?? data.ok ?? true),
        ok: Boolean(data.ok ?? data.success ?? true),
        items: data.items as RawApiUser[],
        total: Number(data.total ?? data.items.length ?? 0),
        page: Number(data.page ?? 1),
        limit: Number(data.limit ?? (data.items?.length ?? 20)),
        pages: Number(data.pages ?? data.totalPages ?? 1),
      };
    }

    if (Array.isArray(data)) {
      return {
        success: true,
        ok: true,
        items: data as RawApiUser[],
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1,
      };
    }

    throw new Error("Invalid renters API response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ✅ Verify user KYC (admin)
export const verifyUserKyc = async (id: string): Promise<RawApiUser> => {
  try {
    // Using a generic admin update endpoint that accepts nested kyc fields
    const response = await api.patch<{ success?: boolean; data?: RawApiUser; user?: RawApiUser }>(
      `/admin/users/${id}`,
      { kyc: { verified: true } }
    );

    const data = response.data;
    if (data?.data) return data.data;
    if (data?.user) return data.user;
    if ((data as any)?._id) return data as unknown as RawApiUser;
    throw new Error("Failed to verify user KYC");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ✅ Get user by ID
export const getUserById = async (id: string): Promise<RawApiUser> => {
  try {
    const response = await api.get<{ success: boolean; data: RawApiUser }>(
      `/admin/users/${id}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("User not found");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ✅ Update user status
export const updateUserStatus = async (
  id: string,
  isActive: boolean
): Promise<RawApiUser> => {
  try {
    const response = await api.put<{ success: boolean; data: RawApiUser }>(
      `/admin/users/${id}/status`,
      { isActive }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Failed to update user status");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ✅ Get user statistics
export interface UserStats {
  total: number;
  active: number;
  byRole: {
    admin: number;
    staff: number;
    renter: number;
    partner: number;
  };
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get<{ success: boolean; data: UserStats }>(
      "/admin/users/stats"
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return {
      total: 0,
      active: 0,
      byRole: {
        admin: 0,
        staff: 0,
        renter: 0,
        partner: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      total: 0,
      active: 0,
      byRole: {
        admin: 0,
        staff: 0,
        renter: 0,
        partner: 0,
      },
    };
  }
};

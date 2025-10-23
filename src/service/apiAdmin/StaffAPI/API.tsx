import { AxiosError } from "axios";
import api from "../../Utils";

// ✅ Staff Interface - Match backend response
export interface Staff {
  _id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  isActive: boolean;
  station: string | { _id: string; name: string; location?: any }; // ✅ Can be both
  createdAt?: string;
  updatedAt?: string;
}
// ✅ Create Staff Data - Match backend request body
export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: "male" | "female";
  station: string; // Station ObjectId
}

// ✅ Error Handler
const handleError = (error: unknown) => {
  const err = error as AxiosError;
  console.error("Staff API Error:", {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.message,
  });

  let errorMessage = err?.message || "Unknown error";
  
  // Handle different error response formats
  if (err?.response?.data) {
    const responseData: any = err.response.data;
    console.log("Response data:", responseData);
    
    if (responseData.error) {
      errorMessage = responseData.error;
    } else if (responseData.message) {
      errorMessage = responseData.message;
    } else if (typeof responseData === "string") {
      errorMessage = responseData;
    } else if (responseData.errors && Array.isArray(responseData.errors)) {
      errorMessage = responseData.errors.join(", ");
    }
  } else if (err?.response?.status) {
    // Handle HTTP status codes
    switch (err.response.status) {
      case 400:
        errorMessage = "Bad request - please check your input";
        break;
      case 401:
        errorMessage = "Unauthorized - please login again";
        break;
      case 403:
        errorMessage = "Forbidden - you don't have permission";
        break;
      case 409:
        errorMessage = "Email already exists";
        break;
      case 500:
        errorMessage = "Server error - please try again";
        break;
      default:
        errorMessage = `Request failed with status ${err.response.status}`;
    }
  }

  throw new Error(errorMessage);
};

// ============================================
// ✅ STAFF MANAGEMENT API
// ============================================

/**
 * GET /admin/staffs - Get all staff (admin only)
 * Backend returns: Array<Staff> (direct array, no wrapper)
 * Response format: [ { _id, role, name, email, ... }, ... ]
 */
export const getAllStaffs = async (): Promise<Staff[]> => {
  try {
    const response = await api.get<Staff[]>("/admin/staffs");

    console.log("Get all staffs response:", response.data);

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
 * POST /admin/createStaff - Create new staff (admin only)
 * Request body: { name, email, password, phone, gender, station }
 * Backend returns: { success: true, data: Staff }
 */
export const createStaff = async (
  staffData: CreateStaffData
): Promise<Staff> => {
  try {
    console.log("Creating staff with data:", staffData);

    const response = await api.post<{ success: boolean; data: Staff }>(
      "/admin/createStaff",
      staffData
    );

    console.log("Create staff response:", response.data);

    // ✅ Check for wrapped response first
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // ✅ Fallback: if backend returns staff directly (no wrapper)
    if (response.data._id && response.data.email) {
      return response.data as Staff;
    }

    // ✅ Check if response is array (unlikely but possible)
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }

    console.error("Unexpected response format:", response.data);
    throw new Error("Failed to create staff - unexpected response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const staffManagementAPI = {
  getAllStaffs,
  createStaff,
};

export default staffManagementAPI;

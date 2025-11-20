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

    const response = await api.post<{ success: boolean; data: Staff } | Staff>(
      "/admin/createStaff",
      staffData
    );

    console.log("Create staff response:", response.data);

    // ✅ Check for wrapped response first
    if (typeof response.data === "object" && response.data !== null) {
      if ("success" in response.data && "data" in response.data) {
        const wrappedResponse = response.data as { success: boolean; data: Staff };
        if (wrappedResponse.success && wrappedResponse.data) {
          return wrappedResponse.data;
        }
      }

      // ✅ Fallback: if backend returns staff directly (no wrapper)
      if ("_id" in response.data && "email" in response.data) {
        return response.data as Staff;
      }
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

/**
 * PUT /admin/staffs/:id - Update staff (admin only)
 * Request body: { name, email, phone, role, station, isActive }
 * Backend returns: { success: true, data: Staff }
 */
export const updateStaff = async (
  staffId: string,
  staffData: Partial<Staff>
): Promise<Staff> => {
  try {
    console.log("Updating staff with data:", staffData);

    const response = await api.put<{ success: boolean; data: Staff } | Staff>(
      `/admin/staffs/${staffId}`,
      staffData
    );

    console.log("Update staff response:", response.data);

    // ✅ Check for wrapped response first
    if (typeof response.data === "object" && response.data !== null) {
      if ("success" in response.data && "data" in response.data) {
        const wrappedResponse = response.data as { success: boolean; data: Staff };
        if (wrappedResponse.success && wrappedResponse.data) {
          return wrappedResponse.data;
        }
      }

      // ✅ Fallback: if backend returns staff directly (no wrapper)
      if ("_id" in response.data && "email" in response.data) {
        return response.data as Staff;
      }
    }

    console.error("Unexpected response format:", response.data);
    throw new Error("Failed to update staff - unexpected response format");
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * DELETE /admin/staffs/:id - Delete staff (admin only)
 * Backend returns: { success: true, message: string, deletedStaff: { id, name, email, role, station } }
 */
export interface DeleteStaffResponse {
  success: boolean;
  message: string;
  deletedStaff: {
    id: string;
    name: string;
    email: string;
    role: string;
    
  };
}

export const deleteStaff = async (staffId: string): Promise<DeleteStaffResponse> => {
  try {
    console.log("Deleting staff with id:", staffId);

    const response = await api.delete<DeleteStaffResponse>(
      `/admin/staffs/${staffId}`
    );

    console.log("Delete staff response:", response.data);

    if (!response.data.success) {
      throw new Error("Failed to delete staff");
    }

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const staffManagementAPI = {
  getAllStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
};

export default staffManagementAPI;

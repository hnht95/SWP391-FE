import api from "../Utils";

// Staff Management API
export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: "male" | "female";
  station: string;
}

export interface StaffResponse {
  defaultRefundWallet: null;
  role: "staff";
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  gender: "male" | "female";
  station: string;
  kyc: {
    verified: boolean;
  };
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const staffManagementAPI = {
  async createStaff(payload: CreateStaffInput) {
    console.log("Sending createStaff request with payload:", payload);
    try {
      const res = await api.post("/admin/createStaff", payload);
      console.log("CreateStaff success:", res.data);
      return res.data as StaffResponse;
    } catch (error: any) {
      console.error("CreateStaff error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

};

export default staffManagementAPI;

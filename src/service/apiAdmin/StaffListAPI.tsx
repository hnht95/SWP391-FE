import api from "../Utils";

// Staff List API Response Interface
export interface StaffListItem {
  kyc: {
    verified: boolean;
  };
  _id: string;
  defaultRefundWallet: null;
  role: "staff";
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  gender: "male" | "female";
  station: string | null | {
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    _id: string;
    name: string;
    code: string;
    note: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const staffListAPI = {
  async getAllStaff() {
    const res = await api.get("/admin/staffs");
    return res.data as StaffListItem[];
  },
};

export default staffListAPI;

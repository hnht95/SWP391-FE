import { AxiosError } from "axios";
import api from "../../Utils";

export interface IUserProfile {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  isActive: boolean;
  station: string;
}

interface IProfileResponse {
  success: boolean;
  data: IUserProfile;
}

export const getProfile = async (): Promise<IUserProfile> => {
  try {
    const response = await api.get<IProfileResponse>("/api/users/me");

    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin profile:", error);

    // Xử lý và ném lỗi để React Query hoặc component có thể bắt
    if (error instanceof AxiosError) {
      // Lấy thông báo lỗi từ server nếu có
      const message =
        error.response?.data?.message || "Lấy thông tin profile thất bại";
      throw new Error(message);
    }

    throw new Error("Đã xảy ra lỗi không mong muốn");
  }
};

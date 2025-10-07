// Staff-specific API functions
import { apiWithoutCredentials, handleError } from "../API";

export const login = async (email: string, password: string) => {
  try {
    const payload = { email, password };
    const response = await apiWithoutCredentials.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
}) => {
  try {
    const response = await apiWithoutCredentials.post(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

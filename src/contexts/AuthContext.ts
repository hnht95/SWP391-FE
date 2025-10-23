import { createContext } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "renter" | "staff" | "admin";
  phone: string;
  gender: string;
  kyc: {
    verified: boolean;
  };
  isActive: boolean;
  defaultRefundWallet: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (loginData: { token: string; user: User }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  // Global loading UI while transitioning auth state or redirecting
  showGlobalLoading: () => void;
  hideGlobalLoading: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

import { createContext } from "react";
import type { UserKyc, UserStation, UserAvatar } from "../types/userTypes";

// Extended User interface for Auth context (uses _id from API)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "renter" | "staff" | "admin" | "regular" | "vip";
  phone: string;
  gender: "male" | "female" | "other";
  avatarUrl?: UserAvatar | string | null; // Can be populated object, ID string, or null
  station?: UserStation | null;
  kyc: UserKyc;
  isActive: boolean;
  defaultRefundWallet: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Optional fields
  cccd?: string;
  rentalCount?: number;
  revenue?: number;
  feedback?: string;
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

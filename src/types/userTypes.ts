// User-related types matching DB response

export interface UserAvatar {
  _id: string;
  url: string;
  publicId: string;
  type: string;
  provider: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserKyc {
  idNumber: string | null; // Căn cước công dân (ID card number)
  idFrontImage: string | null;
  idBackImage: string | null;
  licenseFrontImage: string | null;
  licenseBackImage: string | null;
  verified: boolean;
  verifiedAt: string | null;
}

export interface StationLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface UserStation {
  _id: string;
  name: string;
  code: string;
  location: StationLocation;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Raw API User from backend
export interface RawApiUser {
  _id: string;
  defaultRefundWallet: string | null;
  role: "renter" | "regular" | "vip" | "staff";
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  gender: "male" | "female" | "other";
  avatarUrl: UserAvatar; // Can be populated object, ID string, or null
  station: UserStation;
  kyc: UserKyc;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Optional fields
  cccd?: string;
  rentalCount?: number;
  revenue?: number;
  feedback?: string;
}

// UI-facing User model
export interface User {
  id: string;
  avatar?: string | null;
  name: string;
  email: string;
  phone: string;
  type: "regular" | "vip" | "staff" | "renter";
  createdAt: string;
  updatedAt: string;
  status: "active" | "locked" | "verify";
  gender: "male" | "female" | "other";
  station: UserStation | null;
  kyc: UserKyc;
  defaultRefundWallet: string | null;
  cccd?: string;
  rentalCount?: number;
  revenue?: number;
  feedback?: string;
}

export interface UserStats {
  total: number;
  vip: number;
  active: number;
  locked: number;
  newThisMonth: number;
}

export interface CreateUserForm {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  password: string;
  confirmPassword: string;
}

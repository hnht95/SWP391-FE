import type { User, UserStats } from "../types/userTypes";

// Get status badge color classes
export const getStatusBadge = (status: string): string => {
  if (status === "active") return "bg-green-100 text-green-800";
  if (status === "locked") return "bg-red-100 text-red-800";
  if (status === "verify") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

// Get status text
export const getStatusText = (status: string): string => {
  if (status === "active") return "Active";
  if (status === "locked") return "Locked";
  if (status === "verify") return "Need Verify";
  return status;
};

// Calculate user statistics
export const calculateUserStats = (users: User[]): UserStats => {
  const total = users.length;
  const vip = users.filter((u) => u.type === "vip").length;
  const active = users.filter((u) => u.status === "active").length;
  const locked = users.filter((u) => u.status === "locked").length;
  const newThisMonth = users.filter(
    (u) => u.createdAt && u.createdAt.startsWith("2025-10")
  ).length;

  return {
    total,
    vip,
    active,
    locked,
    newThisMonth,
  };
};

// Get type badge color
export const getTypeBadge = (type: string): string => {
  if (type === "vip") return "bg-yellow-100 text-yellow-800";
  if (type === "staff") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

// Get type text
export const getTypeText = (type: string): string => {
  if (type === "vip") return "VIP";
  if (type === "staff") return "Staff";
  if (type === "renter") return "Renter";
  return "Regular";
};

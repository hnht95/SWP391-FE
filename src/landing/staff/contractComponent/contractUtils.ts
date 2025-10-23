/**
 * Contract utility functions for styling and display
 */

/**
 * Get Tailwind CSS classes for status badge
 */
export const getStatusBadge = (status: string): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "expiring":
      return "bg-yellow-100 text-yellow-800";
    case "expired":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get human-readable status text
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case "active":
      return "Active";
    case "expiring":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

/**
 * Calculate contract stats from contracts array
 */
export interface ContractStats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  totalVehicles: number;
  monthlyRevenue: number;
}

export const calculateContractStats = (
  contracts: Array<{
    status: string;
    monthlyFee?: number;
    vehicleCount?: number;
  }>
): ContractStats => {
  return {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    expiring: contracts.filter((c) => c.status === "expiring").length,
    expired: contracts.filter((c) => c.status === "expired").length,
    totalVehicles: contracts.reduce((sum, c) => sum + (c.vehicleCount || 0), 0),
    monthlyRevenue: contracts.reduce((sum, c) => sum + (c.monthlyFee || 0), 0),
  };
};

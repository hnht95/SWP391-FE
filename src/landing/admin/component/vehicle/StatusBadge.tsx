import React from "react";

export type VehicleStatus = "available" | "rented" | "maintenance" | "reserved";

interface StatusBadgeProps {
  status?: VehicleStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<VehicleStatus | string, { color: string; text: string }> = {
    available: { color: "bg-green-100 text-green-800", text: "Available" },
    rented: { color: "bg-blue-100 text-blue-800", text: "Rented" },
    maintenance: {
      color: "bg-yellow-100 text-yellow-800",
      text: "Maintenance",
    },
    reserved: { color: "bg-red-100 text-red-800", text: "Reserved" },
  };

  const config = statusConfig[status] || { 
    color: "bg-gray-100 text-gray-800", 
    text: status || "Unknown" 
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

export default StatusBadge;

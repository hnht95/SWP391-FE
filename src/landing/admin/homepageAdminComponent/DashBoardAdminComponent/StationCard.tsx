import React from "react";
import { motion } from "framer-motion";
import type { Station as StationType } from "../../../../service/apiAdmin/apiStation/API";

export interface StationCardProps {
  station: StationType;
  totalVehicles: number;
  activeCount: number;
  maintenanceCount: number;
  pendingMaintenanceCount: number;
  pendingDeletionCount: number;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  totalVehicles,
  activeCount,
  maintenanceCount,
  pendingMaintenanceCount,
  pendingDeletionCount,
  isHighlighted = false,
  onClick,
}) => {
  const activeRatio =
    totalVehicles > 0 ? Math.min((activeCount / totalVehicles) * 100, 100) : 0;
  const maintenanceTotal = maintenanceCount + pendingMaintenanceCount;
  const maintenanceRatio =
    totalVehicles > 0 ? Math.min((maintenanceTotal / totalVehicles) * 100, 100) : 0;
  const requestsTotal = pendingMaintenanceCount + pendingDeletionCount;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-5 border transition-all ${
        isHighlighted
          ? "border-blue-200 shadow-lg shadow-blue-100/60"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <h3 className="text-gray-900 font-semibold text-lg mb-3">{station.name}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-500">Vehicles</span>
          <span className="text-2xl font-bold text-gray-900">{totalVehicles}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Active</span>
            <span className="font-semibold text-emerald-600">{activeCount}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${activeRatio}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Maintenance</span>
            <span className="font-semibold text-rose-500">{maintenanceTotal}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${maintenanceRatio}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
            <p className="text-gray-900 font-semibold text-sm truncate">
              {station.location?.address || "Not updated"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
            <p
              className={`text-sm font-bold ${
                station.isActive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {station.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
            Maintenance Req: {pendingMaintenanceCount}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-[11px] font-semibold text-purple-600">
            Deletion Req: {pendingDeletionCount}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
            Total Requests: {requestsTotal}
          </span>
        </div>
      </div>
    </button>
  );
};

export default StationCard;


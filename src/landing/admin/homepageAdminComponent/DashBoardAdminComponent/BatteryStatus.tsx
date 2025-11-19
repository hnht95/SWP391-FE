import React from "react";
import { motion } from "framer-motion";
import { MdBatteryChargingFull, MdSpeed } from "react-icons/md";

export interface BatteryStatusProps {
  vehicleModel: string;
  batteryLevel: number;
  range: number;
  status: "available" | "reserved" | "rented" | "maintenance" | "pending_deletion" | "pending_maintenance";
  licensePlate: string;
}

const BatteryStatus: React.FC<BatteryStatusProps> = ({
  vehicleModel,
  batteryLevel,
  range,
  status,
  licensePlate,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "available": return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "reserved": return "text-blue-700 bg-blue-100 border-blue-200";
      case "rented": return "text-blue-700 bg-blue-100 border-blue-200";
      case "maintenance": 
      case "pending_maintenance": return "text-red-700 bg-red-100 border-red-200";
      case "pending_deletion": return "text-orange-700 bg-orange-100 border-orange-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "available": return "AVAILABLE";
      case "reserved": return "RESERVED";
      case "rented": return "RENTED";
      case "maintenance": return "MAINTENANCE";
      case "pending_maintenance": return "PENDING MAINT.";
      case "pending_deletion": return "PENDING DEL.";
      default: return (status as string).toUpperCase();
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 70) return "from-emerald-500 to-green-500";
    if (batteryLevel > 30) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 font-semibold text-lg">{vehicleModel}</h3>
          <p className="text-gray-600 text-sm">{licensePlate}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor()}`}>
          {getStatusDisplay()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Battery Level</span>
          <span className="text-gray-900 font-bold text-xl">{batteryLevel}%</span>
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBatteryColor()} rounded-full shadow-md`}
            initial={{ width: 0 }}
            animate={{ width: `${batteryLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className="absolute inset-0 bg-white/30"
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            <MdSpeed className="w-4 h-4" />
            <span className="text-sm font-medium">{range} km range</span>
          </div>
          <MdBatteryChargingFull className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

export default BatteryStatus;


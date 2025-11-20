import React from "react";
import { motion } from "framer-motion";
import BatteryStatus, { type BatteryStatusProps } from "./BatteryStatus";

interface FleetBatteryMonitorProps {
  featuredVehicles: BatteryStatusProps[];
}

const FleetBatteryMonitor: React.FC<FleetBatteryMonitorProps> = ({
  featuredVehicles,
}) => {
  if (featuredVehicles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Fleet Battery Monitoring</h3>
        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full font-semibold">
          Live
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {featuredVehicles.map((vehicle, index) => (
          <motion.div
            key={`${vehicle.licensePlate}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <BatteryStatus {...vehicle} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FleetBatteryMonitor;


import React from "react";
import { motion } from "framer-motion";
import VehicleRow, { type Vehicle } from "./VehicleRow";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onTransfer?: (vehicle: Vehicle) => void;
  onMarkMaintenance?: (vehicle: Vehicle) => void;
  onRowClick?: (vehicle: Vehicle) => void;
}

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  onEdit,
  onDelete,
  onTransfer,
  onMarkMaintenance,
  onRowClick,
}) => {
  const headers = [
    "Vehicle Info",
    "License Plate",
    "Status",
    "Location",
    "Daily Rate",
    "Last Maintenance",
  ];

  return (
    <div className="space-y-3">
      {/* Vehicle Table */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <motion.th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    {header}
                  </motion.th>
                ))}
                <motion.th
                  className="relative px-6 py-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + headers.length * 0.05 }}
                >
                  <span className="sr-only">Actions</span>
                </motion.th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => onRowClick?.(vehicle)}
                >
                  <VehicleRow
                    vehicle={vehicle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTransfer={onTransfer}
                    onMarkMaintenance={onMarkMaintenance}
                  />
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 px-6 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 + vehicles.length * 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{vehicles.length}</span> of{" "}
            <span className="font-medium">{vehicles.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VehicleTable;

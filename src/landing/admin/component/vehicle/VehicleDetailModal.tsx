import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdDirectionsCar } from "react-icons/md";
import { type Vehicle } from "./VehicleRow";
import StatusBadge from "./StatusBadge";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!vehicle) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdDirectionsCar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Vehicle Details - {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-xs text-gray-500">
                      License Plate: {vehicle.licensePlate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                      Basic Information
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Brand
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.brand}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Model
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.model}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          License Plate
                        </label>
                        <p className="text-sm font-mono font-bold text-gray-900">
                          {vehicle.licensePlate}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Status
                        </label>
                        <StatusBadge status={vehicle.status} />
                      </div>
                    </div>
                  </div>

                  {/* Operational Information */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                      Operation Information
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Current Location
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.location}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Daily Rate
                        </label>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(vehicle.dailyRate)}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Last Maintenance
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(vehicle.lastService).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        Total Trips
                      </p>
                      <p className="text-2xl font-bold text-blue-900">45</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                      <p className="text-xs text-green-600 font-semibold mb-1">
                        Utilization Rate
                      </p>
                      <p className="text-2xl font-bold text-green-900">78%</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200/50">
                      <p className="text-xs text-yellow-600 font-semibold mb-1">
                        Monthly Revenue
                      </p>
                      <p className="text-lg font-bold text-yellow-900">
                        {formatCurrency(15600000)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 font-semibold shadow-md text-sm">
                  Edit
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VehicleDetailModal;

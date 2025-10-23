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
  onEdit?: (vehicle: Vehicle) => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEdit,
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

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Battery Capacity
                        </label>
                        <div className="flex items-center space-x-2">
                          {/* iPhone-style battery icon */}
                          <div className="relative w-8 h-4 bg-gray-200 rounded-sm border border-gray-300">
                            <div 
                              className={`absolute top-0.5 left-0.5 h-3 rounded-sm transition-all duration-300 ${
                                (vehicle.batteryCapacity || 0) > 50 
                                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                                  : (vehicle.batteryCapacity || 0) > 20
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                  : 'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.max(0, (vehicle.batteryCapacity || 0) / 100 * 100))}%` 
                              }}
                            />
                            <div className="absolute -right-0.5 top-1 w-0.5 h-2 bg-gray-300 rounded-r-sm"></div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {vehicle.batteryCapacity || 0} kWh
                          </p>
                        </div>
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

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Created At
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Last Updated
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString("vi-VN") : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Photos */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    Vehicle Photos
                  </h3>
                  
                  {/* Exterior Photos */}
                  {vehicle.defaultPhotos?.exterior && vehicle.defaultPhotos.exterior.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Exterior Photos
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {vehicle.defaultPhotos.exterior.map((photoUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photoUrl}
                              alt={`Exterior ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interior Photos */}
                  {vehicle.defaultPhotos?.interior && vehicle.defaultPhotos.interior.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Interior Photos
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {vehicle.defaultPhotos.interior.map((photoUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photoUrl}
                              alt={`Interior ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Photos Message */}
                  {(!vehicle.defaultPhotos?.exterior?.length && !vehicle.defaultPhotos?.interior?.length) && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdDirectionsCar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm">No photos available for this vehicle</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onEdit?.(vehicle)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 font-semibold shadow-md text-sm"
                >
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

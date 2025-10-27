import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdEdit, MdSwapHoriz, MdBuild, MdWarning, MdDirectionsCar } from "react-icons/md";
import type { Vehicle, Station } from "../../../../../service/apiAdmin/apiVehicles/API";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (vehicle: Vehicle) => void;
  onTransfer?: (vehicle: Vehicle) => void;
  onReportMaintenance?: (vehicle: Vehicle) => void;
  onRequestDeletion?: (vehicle: Vehicle) => void;
  getStationName?: (stationIdOrObject: string | Station) => string;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onTransfer,
  onReportMaintenance,
  onRequestDeletion,
  getStationName,
}) => {
  if (!vehicle) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "rented":
        return "bg-blue-100 text-blue-700";
      case "reserved":
        return "bg-yellow-100 text-yellow-700";
      case "maintenance":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MdDirectionsCar className="w-6 h-6 text-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-sm text-gray-500">
                      License Plate: {vehicle.plateNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Vehicle Image */}
                <div className="flex justify-center">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-64 h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MdDirectionsCar className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Vehicle Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Brand:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Model:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Year:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Color:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">VIN:</span>
                        <span className="text-sm font-medium text-gray-900 font-mono">{vehicle.vin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Status & Location</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(vehicle.status)}`}>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeof vehicle.station === 'object' 
                            ? vehicle.station.name 
                            : (getStationName && vehicle.station ? getStationName(vehicle.station) : "Unknown")
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Battery Capacity:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.batteryCapacity || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Mileage:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Daily Rate:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.pricePerDay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Hourly Rate:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.pricePerHour)}</span>
                      </div>
                      {vehicle.valuation && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Valuation:</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.valuation.valueVND)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Technical Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Battery Capacity:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.batteryCapacity} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.ratingAvg?.toFixed(1) || "N/A"} ({vehicle.ratingCount || 0} reviews)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.createdAt ? formatDate(vehicle.createdAt) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Updated:</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.updatedAt ? formatDate(vehicle.updatedAt) : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance History */}
                {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Maintenance</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {vehicle.maintenanceHistory.slice(0, 3).map((maintenance, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{maintenance.description}</p>
                              <p className="text-xs text-gray-500">Reported by: {maintenance.staff}</p>
                            </div>
                            <span className="text-xs text-gray-500 ml-4">
                              {formatDate(maintenance.reportedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {vehicle.tags && vehicle.tags.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Close
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-xl hover:bg-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {onTransfer && (
                  <button
                    onClick={() => onTransfer(vehicle)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-xl hover:bg-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdSwapHoriz className="w-4 h-4" />
                    <span>Transfer</span>
                  </button>
                )}
                {onReportMaintenance && (
                  <button
                    onClick={() => onReportMaintenance(vehicle)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded-xl hover:bg-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdBuild className="w-4 h-4" />
                    <span>Report Maintenance</span>
                  </button>
                )}
                {onRequestDeletion && (
                  <button
                    onClick={() => onRequestDeletion(vehicle)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-xl hover:bg-red-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdWarning className="w-4 h-4" />
                    <span>Request Deletion</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleDetailModal;

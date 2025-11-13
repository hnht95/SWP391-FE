import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdEdit,
  MdSwapHoriz,
  MdDirectionsCar,
  MdPhotoCamera,
  MdImage,
  MdMoreHoriz,
  MdDeleteForever,
} from "react-icons/md";
import { GrHostMaintenance } from "react-icons/gr";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";
import { getPhotoUrls } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { IconType } from "react-icons";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (vehicle: Vehicle) => void;
  onTransfer?: (vehicle: Vehicle) => void;
  onReportMaintenance?: (vehicle: Vehicle) => void;
  onRequestDeletion?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  getStationName?: (stationIdOrObject: string | Station) => string;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onTransfer,
  onReportMaintenance,
  onDelete,
  getStationName,
}) => {
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowActions(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowActions(false);
    onClose();
  };

  interface ActionButtonConfig {
    key: string;
    label: string;
    icon: IconType;
    onClick: () => void;
    colorClass: string;
    hoverClass?: string;
    disabled?: boolean;
    title?: string;
  }

  const actionButtons = useMemo<ActionButtonConfig[]>(() => {
    if (!vehicle) return [];

    const actions: ActionButtonConfig[] = [];

    if (onEdit) {
      actions.push({
        key: "edit",
        label: "Edit",
        icon: MdEdit,
        onClick: () => onEdit(vehicle),
        colorClass: "bg-blue-600",
        hoverClass: "hover:bg-blue-700 focus:ring-blue-200",
        title: "Edit vehicle information",
      });
    }

    if (onTransfer) {
      actions.push({
        key: "transfer",
        label: "Transfer",
        icon: MdSwapHoriz,
        onClick: () => onTransfer(vehicle),
        colorClass: "bg-green-600",
        hoverClass: "hover:bg-green-700 focus:ring-green-200",
        title: "Transfer vehicle to another station",
      });
    }

    if (onReportMaintenance) {
      actions.push({
        key: "maintenance",
        label: "Maintenance",
        icon: GrHostMaintenance,
        onClick: () => onReportMaintenance(vehicle),
        colorClass: "bg-orange-500",
        hoverClass: "hover:bg-orange-600 focus:ring-orange-200",
        title: "Report maintenance for this vehicle",
      });
    }

    if (onDelete) {
      const isDisabled =
        vehicle.status === "rented" || vehicle.status === "reserved";

      actions.push({
        key: "delete",
        label: "Delete",
        icon: MdDeleteForever,
        onClick: () => onDelete(vehicle),
        colorClass: isDisabled ? "bg-gray-300" : "bg-red-600",
        hoverClass: isDisabled ? undefined : "hover:bg-red-700 focus:ring-red-200",
        disabled: isDisabled,
        title: isDisabled
          ? "Cannot delete vehicle in rented or reserved status"
          : "Delete this vehicle",
      });
    }

    return actions;
  }, [
    onDelete,
    onEdit,
    onReportMaintenance,
    onTransfer,
    vehicle,
  ]);

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
          <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
          
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
              <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-gradient-to-r from-black via-gray-900 to-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
                <div className="flex items-center space-x-3">
                  <MdDirectionsCar className="w-7 h-7 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-base text-gray-300">
                      License Plate: {vehicle.plateNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <MdClose className="w-6 h-6 text-gray-200" />
                </button>
              </div>

              {/* Content */}
              <div className="relative flex flex-col md:flex-row md:items-start gap-6 p-4">
                <AnimatePresence>
                  {showActions && actionButtons.length > 0 && (
                    <motion.aside
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="md:sticky md:top-24 md:self-start"
                    >
                      <div className="flex md:flex-col gap-4 md:pr-4 md:border-r md:border-gray-100">
                        {actionButtons.map(
                          ({
                            key,
                            label,
                            icon: Icon,
                            onClick,
                            colorClass,
                            hoverClass,
                            disabled,
                            title,
                          }) => (
                            <div
                              key={key}
                              className="flex flex-col items-center gap-2 text-center"
                            >
                              <button
                                type="button"
                                onClick={onClick}
                                disabled={disabled}
                                title={title}
                                className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  disabled
                                    ? "cursor-not-allowed text-gray-500"
                                    : "hover:scale-105"
                                } ${colorClass} ${hoverClass ?? ""}`}
                              >
                                <Icon className="w-5 h-5" />
                              </button>
                              <span className="text-xs font-medium text-gray-600 max-w-[5rem] leading-tight">
                                {label}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                <div className="flex-1 space-y-4">
                  {/* Vehicle Main Image */}
                  <div className="flex justify-center">
                    {(() => {
                      const exteriorPhotos = vehicle.defaultPhotos?.exterior
                        ? getPhotoUrls(vehicle.defaultPhotos.exterior)
                        : [];
                      const mainPhoto = exteriorPhotos[0];

                      return mainPhoto ? (
                        <img
                          src={mainPhoto}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-64 h-48 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <MdDirectionsCar className="w-16 h-16 text-gray-400" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Vehicle Photos Gallery */}
                  {vehicle.defaultPhotos?.exterior?.length ||
                  vehicle.defaultPhotos?.interior?.length ? (
                    <details className="space-y-3 group" open>
                      <summary className="cursor-pointer list-none flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold text-gray-800">
                          Photos
                        </span>
                        <span className="text-xs text-gray-500">
                          Click to collapse
                        </span>
                      </summary>
                      <div className="space-y-3">
                        {/* Exterior Photos */}
                        {vehicle.defaultPhotos?.exterior &&
                          vehicle.defaultPhotos.exterior.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <MdPhotoCamera className="w-5 h-5 text-blue-600" />
                                Exterior Photos (
                                {
                                  getPhotoUrls(
                                    vehicle.defaultPhotos.exterior
                                  ).length
                                }
                                )
                              </h4>
                              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {getPhotoUrls(
                                  vehicle.defaultPhotos.exterior
                                ).map((photoUrl, index) => (
                                  <motion.div
                                    key={`exterior-${index}`}
                                    className="relative group cursor-pointer"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Exterior ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-md border border-blue-200 hover:border-blue-400 transition-colors"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Interior Photos */}
                        {vehicle.defaultPhotos?.interior &&
                          vehicle.defaultPhotos.interior.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <MdImage className="w-5 h-5 text-green-600" />
                                Interior Photos (
                                {
                                  getPhotoUrls(
                                    vehicle.defaultPhotos.interior
                                  ).length
                                }
                                )
                              </h4>
                              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {getPhotoUrls(
                                  vehicle.defaultPhotos.interior
                                ).map((photoUrl, index) => (
                                  <motion.div
                                    key={`interior-${index}`}
                                    className="relative group cursor-pointer"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Interior ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-md border border-green-200 hover:border-green-400 transition-colors"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </details>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdPhotoCamera className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No photos available for this vehicle
                      </p>
                    </div>
                  )}

                  {/* Vehicle Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Basic Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Brand:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.brand}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Model:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.model}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Year:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.year}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Color:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.color}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">VIN:</span>
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {vehicle.vin}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Location */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Status & Location
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                              vehicle.status
                            )}`}
                          >
                            {vehicle.status.charAt(0).toUpperCase() +
                              vehicle.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Location:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {typeof vehicle.station === "object"
                              ? vehicle.station.name
                              : getStationName && vehicle.station
                              ? getStationName(vehicle.station)
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Battery Capacity:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.batteryCapacity || 0} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Mileage:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Pricing
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Daily Rate:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(vehicle.pricePerDay)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Hourly Rate:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(vehicle.pricePerHour)}
                          </span>
                        </div>
                        {vehicle.valuation && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              Valuation:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(vehicle.valuation.valueVND)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Technical Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Battery Capacity:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.batteryCapacity} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rating:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.ratingAvg?.toFixed(1) || "N/A"} (
                            {vehicle.ratingCount || 0} reviews)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Created:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.createdAt
                              ? formatDate(vehicle.createdAt)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Last Updated:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vehicle.updatedAt
                              ? formatDate(vehicle.updatedAt)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance History */}
                  {vehicle.maintenanceHistory &&
                    vehicle.maintenanceHistory.length > 0 && (
                      <details className="space-y-2 group" open>
                        <summary className="cursor-pointer list-none flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Recent Maintenance
                          </h3>
                          <span className="text-xs text-gray-500">
                            Click to collapse
                          </span>
                        </summary>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="space-y-2 text-sm">
                            {vehicle.maintenanceHistory
                              .slice(0, 3)
                              .map((maintenance, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-start"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900">
                                      {maintenance.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Reported by: {maintenance.staff}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500 ml-4">
                                    {formatDate(maintenance.reportedAt)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </details>
                    )}

                  {/* Tags */}
                  {vehicle.tags && vehicle.tags.length > 0 && (
                    <details className="space-y-2 group">
                      <summary className="cursor-pointer list-none flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Tags
                        </h3>
                        <span className="text-xs text-gray-500">
                          Click to expand
                        </span>
                      </summary>
                      <div className="flex flex-wrap gap-2 p-1">
                        {vehicle.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 gap-3">
                <span className="text-sm text-gray-500">
                  {showActions
                    ? "Select an action from the side menu"
                    : "Need to perform an action?"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Close
                  </button>
                  {actionButtons.length > 0 && (
                    <button
                      onClick={() => setShowActions((prev) => !prev)}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {showActions ? (
                        <>
                          <MdClose className="w-4 h-4 text-white" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <MdMoreHoriz className="w-5 h-5 text-white" />
                          <span>More</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleDetailModal;

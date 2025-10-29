import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdEdit, MdSwapHoriz, MdWarning, MdMoreVert } from "react-icons/md";
import { GrHostMaintenance } from "react-icons/gr";
import type { Vehicle, Station } from "../../../../../service/apiAdmin/apiVehicles/API";
import { getStationId, getStationName as getStationNameHelper } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { StatusStyle } from "../../../../../types/vehicle";

interface VehicleRowProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onTransfer?: (vehicle: Vehicle) => void;
  onReportMaintenance?: (vehicle: Vehicle) => void;
  onRequestDeletion?: (vehicle: Vehicle) => void;
  getStationName?: (stationIdOrObject: string | Station) => string;
}

const VehicleRow: React.FC<VehicleRowProps> = ({
  vehicle,
  onEdit,
  onTransfer,
  onReportMaintenance,
  onRequestDeletion,
  getStationName,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);
  
  // Add safety check
  if (!vehicle) {
    console.error("❌ VehicleRow: vehicle is null/undefined");
    return (
      <tr>
        <td colSpan={6} className="px-6 py-4 text-center text-red-500">
          Error: Vehicle data is missing
        </td>
      </tr>
    );
  }

  console.log("🚗 VehicleRow rendering:", vehicle);
  console.log("🏢 Station data:", vehicle.stationData);
  const getStatusStyle = (status: string): StatusStyle => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-100 text-green-700",
          label: "Available",
          dotColor: "bg-green-500",
        };
      case "rented":
        return {
          color: "bg-blue-100 text-blue-700",
          label: "Rented",
          dotColor: "bg-blue-500",
        };
      case "reserved":
        return {
          color: "bg-yellow-100 text-yellow-700",
          label: "Reserved",
          dotColor: "bg-yellow-500",
        };
      case "maintenance":
        return {
          color: "bg-red-100 text-red-700",
          label: "Maintenance",
          dotColor: "bg-red-500",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          label: "Unknown",
          dotColor: "bg-gray-500",
        };
    }
  };

  const statusStyle = getStatusStyle(vehicle.status);

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
    });
  };

  return (
    <>
      {/* Vehicle Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">
                {vehicle.brand.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {vehicle.brand} {vehicle.model}
            </div>
            <div className="text-sm text-gray-500">
              {vehicle.year} • {vehicle.color}
            </div>
          </div>
        </div>
      </td>

      {/* License Plate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {vehicle.plateNumber}
        </div>
        
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
          <span className={`w-2 h-2 rounded-full ${statusStyle.dotColor} mr-1.5`}></span>
          {statusStyle.label}
        </span>
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {typeof vehicle.station === 'object' 
            ? vehicle.station.name 
            : (getStationName ? getStationName(vehicle.station) : "Unknown")
          }
        </div>
        
      </td>

      {/* Daily Rate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(vehicle.pricePerDay)}
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(vehicle.pricePerHour)}/hour
        </div>
      </td>

      {/* Last Maintenance */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {vehicle.updatedAt ? formatDate(vehicle.updatedAt) : "No data"}
        </div>
        <div className="text-sm text-gray-500">
          {vehicle.mileage.toLocaleString()} km
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsPopupOpen(!isPopupOpen);
            }}
            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
            title="More Actions"
          >
            <MdMoreVert className="w-4 h-4" />
          </motion.button>
          
          {/* Popup Menu */}
          <AnimatePresence>
            {isPopupOpen && (
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
              >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopupOpen(false);
                  onEdit?.(vehicle);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2"
              >
                <MdEdit className="w-4 h-4 text-blue-600" />
                <span>Edit Vehicle</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopupOpen(false);
                  onTransfer?.(vehicle);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center space-x-2"
              >
                <MdSwapHoriz className="w-4 h-4 text-green-600" />
                <span>Transfer Vehicle</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopupOpen(false);
                  onReportMaintenance?.(vehicle);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center space-x-2"
              >
                <GrHostMaintenance className="w-4 h-4 text-orange-600" />
                <span>Report Maintenance</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopupOpen(false);
                  onRequestDeletion?.(vehicle);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2"
              >
                <MdWarning className="w-4 h-4 text-red-600" />
                <span>Request Deletion</span>
              </button>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </>
  );
};

export default VehicleRow;

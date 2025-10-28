import React, { useState } from "react";
import { MdMoreVert } from "react-icons/md";
import StatusBadge, { type VehicleStatus } from "./StatusBadge";
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  status: VehicleStatus;
  location: string;
  dailyRate: number;
  lastService: string;
  batteryCapacity?: number;
  createdAt?: string;
  updatedAt?: string;
  defaultPhotos?: {
    exterior: string[];
    interior: string[];
  };
}

interface VehicleRowProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onTransfer?: (vehicle: Vehicle) => void;
  onMarkMaintenance?: (vehicle: Vehicle) => void;
}

const VehicleRow: React.FC<VehicleRowProps> = ({
  vehicle,
  onEdit,
  onDelete,
  onTransfer,
  onMarkMaintenance,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleEdit = () => {
    onEdit?.(vehicle);
  };

  const handleDelete = () => {
    onDelete?.(vehicle.id);
  };

  const handleTransfer = () => {
    onTransfer?.(vehicle);
    setIsDropdownOpen(false);
  };

  const handleMarkMaintenance = () => {
    onMarkMaintenance?.(vehicle);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {vehicle.brand}
          </div>
          <div className="text-sm text-gray-500">{vehicle.model}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-gray-900">
          {vehicle.licensePlate}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vehicle.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vehicle.dailyRate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(vehicle.lastService).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="text-gray-900 hover:text-black transition-colors"
            title="Actions"
          >
            <MdMoreVert className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown when clicking outside */}
              <div
                className="fixed inset-0 z-[9999]"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-[9999] min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTransfer();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Transfer Vehicle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkMaintenance();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark Maintenance
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </>
  );
};

export default VehicleRow;

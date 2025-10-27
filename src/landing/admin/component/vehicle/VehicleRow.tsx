import React, { useState } from "react";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
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
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="Edit"
          >
            <MdEdit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <MdDelete className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-gray-600 hover:text-gray-900 p-1"
              title="More Actions"
            >
              <MdMoreVert className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-[9999] min-w-[160px]">
                  <button
                    onClick={handleTransfer}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Transfer Vehicle
                  </button>
                  <button
                    onClick={handleMarkMaintenance}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mark Maintenance
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default VehicleRow;

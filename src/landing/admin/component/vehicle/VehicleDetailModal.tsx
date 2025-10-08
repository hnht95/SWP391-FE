import React from "react";
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
  if (!isOpen || !vehicle) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MdDirectionsCar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Vehicle Details - {vehicle.brand} {vehicle.model}
              </h2>
              <p className="text-sm text-gray-500">License Plate: {vehicle.licensePlate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <p className="text-sm text-gray-900">{vehicle.brand}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dòng xe
                  </label>
                  <p className="text-sm text-gray-900">{vehicle.model}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate
                  </label>
                  <p className="text-sm font-mono text-gray-900">{vehicle.licensePlate}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <StatusBadge status={vehicle.status} />
                </div>
              </div>
            </div>

            {/* Operational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Operation Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Location
                  </label>
                  <p className="text-sm text-gray-900">{vehicle.location}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rate
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatCurrency(vehicle.dailyRate)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Maintenance
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(vehicle.lastService).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Tổng số chuyến</p>
                <p className="text-2xl font-bold text-blue-900">45</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Tỷ lệ sử dụng</p>
                <p className="text-2xl font-bold text-green-900">78%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Doanh thu tháng</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(15600000)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;

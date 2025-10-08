import React from "react";
import { MdLocationOn, MdEdit } from "react-icons/md";

export interface Station {
  id: string;
  name: string;
  address: string;
  vehicleCount: number;
  status: "active" | "maintenance" | "inactive";
}

interface StationCardProps {
  station: Station;
  onEdit?: (station: Station) => void;
  onViewDetails?: (station: Station) => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  onEdit,
  onViewDetails,
}) => {
  const getStatusBadge = (status: Station["status"]) => {
    const config = {
      active: { color: "bg-green-100 text-green-800", text: "Hoạt động" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", text: "Bảo trì" },
      inactive: { color: "bg-gray-100 text-gray-800", text: "Không hoạt động" },
    };
    return config[status];
  };

  const statusConfig = getStatusBadge(station.status);

  return (
    <div className="p-6 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <MdLocationOn className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{station.name}</h3>
            <p className="text-gray-600 mt-1">{station.address}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                {station.vehicleCount} xe
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
              >
                {statusConfig.text}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(station)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <MdEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewDetails?.(station)}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationCard;

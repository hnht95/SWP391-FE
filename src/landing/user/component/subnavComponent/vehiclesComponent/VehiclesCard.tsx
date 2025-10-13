// VehiclesCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "../../../../../service/apiVehicles/API";
import { FaBatteryFull, FaCar, FaStar } from "react-icons/fa";

interface VehiclesCardProps {
  car: Vehicle;
}

const VehiclesCard: React.FC<VehiclesCardProps> = ({ car }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/vehicles/${car._id}`);
  };

  // ✅ Function to get status badge color classes
  const getStatusColor = (status: string) => {
    const statusColors = {
      available: "bg-green-500 text-white", // ✅ Xanh lá
      rented: "bg-red-500 text-white", // ✅ Đỏ
      maintenance: "bg-yellow-500 text-white", // ✅ Vàng
      reserved: "bg-purple-500 text-white", // ✅ Tím
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-500 text-white"
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Image - placeholder nếu không có */}
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        <FaCar className="text-gray-400 text-6xl" />

        {/* ✅ Status Badge với màu động */}
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
            car.status
          )}`}
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">
          {car.brand} {car.model}
        </h3>

        {/* VIN & Plate */}
        <p className="text-gray-600 text-sm mb-3">
          {car.plateNumber} • {car.year}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between mb-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <FaBatteryFull className="text-green-500" />
            <span>{car.batteryCapacity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCar />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          {car.ratingAvg && (
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" />
              <span>{car.ratingAvg.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {car.pricePerDay.toLocaleString()}đ
              <span className="text-sm text-gray-500">/day</span>
            </p>
            <p className="text-sm text-gray-500">
              {car.pricePerHour.toLocaleString()}đ/hour
            </p>
          </div>
          <button
            onClick={handleViewDetails}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclesCard;

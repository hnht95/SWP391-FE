// VehiclesCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
// import type { Station } from "../../../../../service/apiStations/API";
import { FaBatteryFull, FaCar, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";

interface VehiclesCardProps {
  car: Vehicle;
  station?: Station; // ✅ Receive station from parent
}

const VehiclesCard: React.FC<VehiclesCardProps> = ({ car, station }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/vehicles/${car._id}`);
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      available: "bg-green-500 text-white",
      rented: "bg-red-500 text-white",
      maintenance: "bg-yellow-500 text-white",
      reserved: "bg-purple-500 text-white",
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-500 text-white"
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        <FaCar className="text-gray-400 text-6xl" />

        {/* Status Badge */}
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

        {/* ✅ Station Location */}
        {station && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {station.name}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {station.location.address}
              </p>
            </div>
          </div>
        )}

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

          {/* Rating */}
          {car.ratingAvg ? (
            <div className="flex items-center gap-1">
              <span className="font-semibold">{car.ratingAvg.toFixed(1)}</span>
              <FaStar className="text-yellow-400" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-400">0.0</span>
              <FaStar className="text-gray-300" />
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

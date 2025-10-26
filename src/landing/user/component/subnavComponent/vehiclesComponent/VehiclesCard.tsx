// VehiclesCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";
import { FaBatteryFull, FaCar, FaStar, FaMapMarkerAlt } from "react-icons/fa";

interface VehiclesCardProps {
  car: Vehicle;
  station?: Station;
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

  // ✅ Get vehicle image from defaultPhotos.exterior or interior
  const getVehicleImage = (): string | null => {
    // Try exterior first
    if (car.defaultPhotos?.exterior?.[0]?.url) {
      return car.defaultPhotos.exterior[0].url;
    }
    // Fallback to interior
    if (car.defaultPhotos?.interior?.[0]?.url) {
      return car.defaultPhotos.interior[0].url;
    }
    return null;
  };

  const vehicleImage = getVehicleImage();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* ✅ Image Section - với ảnh thật hoặc placeholder */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {vehicleImage ? (
          <img
            src={vehicleImage}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // ✅ Fallback nếu ảnh lỗi
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg class="text-gray-400 w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                `;
              }
            }}
          />
        ) : (
          // ✅ Placeholder khi không có ảnh
          <div className="w-full h-full flex items-center justify-center">
            <FaCar className="text-gray-400 text-6xl" />
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
            car.status
          )} backdrop-blur-sm bg-opacity-90`}
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </div>

        {/* ✅ Image count indicator (nếu có nhiều ảnh) */}
        {car.defaultPhotos &&
          (car.defaultPhotos.exterior.length > 1 ||
            car.defaultPhotos.interior.length > 0) && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              📷{" "}
              {car.defaultPhotos.exterior.length +
                car.defaultPhotos.interior.length}
            </div>
          )}
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
          {car.ratingAvg && car.ratingAvg > 0 ? (
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

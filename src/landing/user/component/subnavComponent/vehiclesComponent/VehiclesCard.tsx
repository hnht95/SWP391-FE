// VehiclesCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";
import { FaBatteryFull, FaCar, FaStar, FaCamera } from "react-icons/fa";

interface VehiclesCardProps {
  car: Vehicle;
  station?: Station;
}

const VehiclesCard: React.FC<VehiclesCardProps> = ({ car }) => {
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
  const totalPhotos =
    (car.defaultPhotos?.exterior?.length || 0) +
    (car.defaultPhotos?.interior?.length || 0);

  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow border-slate-100">
      {/* ✅ Image Section - Tăng height và width */}
      <div className="relative h-64 bg-gray-200 overflow-hidden group">
        {vehicleImage ? (
          <img
            src={vehicleImage}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // ✅ Fallback với React Icons khi ảnh lỗi
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector(".fallback-icon")) {
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className =
                  "fallback-icon w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200";
                fallbackDiv.innerHTML = `
                  <div class="text-center">
                    <div class="text-gray-400 mb-2 flex justify-center">
                      ${/* Use FaCar icon */ ""}
                    </div>
                    <p class="text-gray-500 text-sm">No Image</p>
                  </div>
                `;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          // ✅ Placeholder với React Icons khi không có ảnh
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <FaCar className="text-gray-400 text-7xl mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No Image</p>
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div
          className={`absolute top-3 right-3 px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
            car.status
          )} backdrop-blur-md bg-opacity-90 shadow-lg`}
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </div>

        {/* ✅ Photo count indicator với React Icons */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
            <FaCamera className="text-xs" />
            <span>{totalPhotos}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">
          {car.brand} {car.model}
        </h3>

        {/* Plate & Year */}
        <p className="text-gray-600 text-sm mb-3 font-medium">
          {car.plateNumber} • {car.year}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between mb-4 text-gray-700 text-sm">
          <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
            <FaBatteryFull className="text-green-600 text-base" />
            <span className="font-medium">{car.batteryCapacity}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
            <FaCar className="text-gray-600 text-base" />
            <span className="font-medium">
              {car.mileage.toLocaleString()} km
            </span>
          </div>

          {/* Rating */}
          {car.ratingAvg && car.ratingAvg > 0 ? (
            <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded">
              <FaStar className="text-yellow-500 text-base" />
              <span className="font-semibold text-gray-900">
                {car.ratingAvg.toFixed(1)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
              <FaStar className="text-gray-400 text-base" />
              <span className="font-medium text-gray-500">N/A</span>
            </div>
          )}
        </div>

        {/* Price & Button */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {car.pricePerDay.toLocaleString()}đ
              <span className="text-sm text-gray-500 font-normal ml-1">
                /day
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {car.pricePerHour.toLocaleString()}đ/hour
            </p>
          </div>

          <button
            onClick={handleViewDetails}
            className="bg-black/80 cursor-pointer text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclesCard;

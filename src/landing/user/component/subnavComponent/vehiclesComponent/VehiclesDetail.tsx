import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthRequired } from "../../../../../hooks/useAuthRequired";
import { useRoleBasedNavigation } from "../../../../../hooks/useRoleBasedNavigation";
import {
  getVehicleById,
  type Vehicle,
} from "../../../../../service/apiVehicles/API";
import { FaCar, FaArrowLeft, FaBatteryFull } from "react-icons/fa";
import StarRating from "./StarRating";

const VehiclesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requireAuth, isAuthenticated } = useAuthRequired();
  const { getNavigationPaths } = useRoleBasedNavigation();
  const navigationPaths = getNavigationPaths();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError("No vehicle ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getVehicleById(id);
        console.log("Fetched vehicle:", data);
        setVehicle(data);
      } catch (err: any) {
        console.error("Failed to fetch vehicle:", err);
        setError(err.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading vehicle details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-600 text-xl font-bold mb-2">
            {error || "Vehicle Not Found"}
          </h2>
          <p className="text-red-500 mb-4">
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vehicle Image Placeholder */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
              <FaCar className="text-gray-400 text-9xl" />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="lg:w-1/2 w-full">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-2">
              {vehicle.brand} {vehicle.model}
            </h1>

            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  vehicle.status === "available"
                    ? "bg-green-100 text-green-700"
                    : vehicle.status === "rented"
                    ? "bg-red-100 text-red-700"
                    : vehicle.status === "reserved"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {vehicle.status.charAt(0).toUpperCase() +
                  vehicle.status.slice(1)}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-green-600">
                {vehicle.pricePerDay.toLocaleString()}đ
                <span className="text-lg text-gray-500 ml-2 font-normal">
                  /day
                </span>
              </p>
              <p className="text-xl text-gray-600 mt-1">
                {vehicle.pricePerHour.toLocaleString()}đ
                <span className="text-sm text-gray-500 ml-1 font-normal">
                  /hour
                </span>
              </p>
            </div>

            {/* Specifications Grid - Two columns */}
            <div className="space-y-4 mb-6">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plate Number</p>
                  <p className="font-semibold text-gray-900">
                    {vehicle.plateNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">VIN</p>
                  <p className="font-semibold text-gray-900 text-xs">
                    {vehicle.vin}
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="font-semibold text-gray-900">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Color</p>
                  <p className="font-semibold text-gray-900">{vehicle.color}</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Battery</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaBatteryFull className="text-green-500" />
                    {vehicle.batteryCapacity}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mileage</p>
                  <p className="font-semibold text-gray-900">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>

              {/* Rating - Full width */}
              <div className="pt-2 border-t border-gray-200">
                <StarRating
                  rating={vehicle.ratingAvg || 0}
                  showValue={true}
                  reviewCount={vehicle.ratingCount}
                  size="md"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
              This {vehicle.brand} {vehicle.model} ({vehicle.year}) is a premium
              electric vehicle offering exceptional performance and comfort.
              With a battery capacity of {vehicle.batteryCapacity}% and low
              mileage of {vehicle.mileage.toLocaleString()} km, it's perfect for
              both city commutes and long road trips. Experience the future of
              sustainable transportation.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() =>
                  requireAuth(
                    () => {
                      if (navigationPaths.booking) {
                        navigate(navigationPaths.booking(vehicle._id));
                      }
                    },
                    {
                      message: `Please login to book ${vehicle.brand} ${vehicle.model}`,
                    }
                  )
                }
                disabled={vehicle.status !== "available"}
                className={`flex-1 font-bold py-3 rounded-lg transition-all ${
                  vehicle.status === "available"
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {vehicle.status === "available"
                  ? isAuthenticated
                    ? "Book Now"
                    : "Login to Book"
                  : "Not Available"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-black font-bold py-3 rounded-lg hover:bg-gray-300 transition-all inline-flex items-center justify-center gap-2"
              >
                <FaArrowLeft />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesDetail;

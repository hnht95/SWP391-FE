import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthRequired } from "../../../../../hooks/useAuthRequired";
import { useRoleBasedNavigation } from "../../../../../hooks/useRoleBasedNavigation";
import {
  getVehicleById,
  type Vehicle,
  type VehiclePhoto,
} from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";
import {
  FaCar,
  FaArrowLeft,
  FaBatteryFull,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import StarRating from "./StarRating";

// ✅ Carousel Component riêng biệt
interface ImageCarouselProps {
  images: VehiclePhoto[];
  title: string;
  emptyMessage: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  emptyMessage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (images.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
        <div className="relative bg-gray-200 rounded-xl h-64 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <FaCar className="text-6xl mx-auto mb-2" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>

      {/* Main Image */}
      <div className="relative bg-gray-200 rounded-xl h-64 overflow-hidden group mb-3">
        <img
          src={images[currentIndex].url}
          alt={`${title} - ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "";
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Navigation Arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <FaChevronRight />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery (only if multiple images) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image._id}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-16 rounded-lg overflow-hidden border-2 transition ${
                currentIndex === index
                  ? "border-black scale-105"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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

  const station =
    typeof vehicle.station === "object" ? (vehicle.station as Station) : null;

  // ✅ Get exterior and interior photos separately
  const exteriorPhotos = vehicle.defaultPhotos?.exterior || [];
  const interiorPhotos = vehicle.defaultPhotos?.interior || [];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ✅ Left Column - Images Section */}
          <div className="lg:w-1/2 w-full">
            {/* Exterior Photos Carousel */}
            <ImageCarousel
              images={exteriorPhotos}
              title="Outside Photos"
              emptyMessage="No outside photos available"
            />

            {/* Interior Photos Carousel */}
            <ImageCarousel
              images={interiorPhotos}
              title="Inside Photos"
              emptyMessage="No inside photos available"
            />
          </div>

          {/* ✅ Right Column - Vehicle Details */}
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

            {/* Station Location */}
            {station && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-red-500 mt-1 text-xl flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      Current Location
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {station.location.address}
                    </p>
                    {station.code && (
                      <p className="text-xs text-gray-500 mt-1">
                        Station Code: {station.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            {/* Specifications Grid */}
            <div className="space-y-4 mb-6">
              {/* ✅ Row 1 - Removed VIN, only Plate Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plate Number</p>
                  <p className="font-semibold text-gray-900">
                    {vehicle.plateNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="font-semibold text-gray-900">{vehicle.year}</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Color</p>
                  <p className="font-semibold text-gray-900">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Battery</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaBatteryFull className="text-green-500" />
                    {vehicle.batteryCapacity}%
                  </p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mileage</p>
                  <p className="font-semibold text-gray-900">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={vehicle.ratingAvg || 0}
                      showValue={true}
                      reviewCount={vehicle.ratingCount}
                      size="sm"
                    />
                  </div>
                </div>
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
            <div className="flex space-x-4">
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

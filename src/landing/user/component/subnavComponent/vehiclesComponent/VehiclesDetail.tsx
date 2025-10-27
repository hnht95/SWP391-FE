// VehiclesDetail.tsx
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

// ✅ Carousel Component
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

  // ✅ Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <FaCar className="text-6xl mx-auto mb-2" />
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>

      {/* Main Image */}
      <div className="relative bg-gray-200 rounded-xl h-64 overflow-hidden group mb-3 shadow-md">
        <img
          src={images[currentIndex].url}
          alt={`${title} - ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".fallback-icon")) {
              const fallbackDiv = document.createElement("div");
              fallbackDiv.className =
                "fallback-icon w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200";
              fallbackDiv.innerHTML = `
                <div class="text-center">
                  <div class="text-gray-400 text-6xl mb-2">🚗</div>
                  <p class="text-gray-500 text-sm">Image not available</p>
                </div>
              `;
              parent.appendChild(fallbackDiv);
            }
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              aria-label="Previous image"
            >
              <FaChevronLeft className="text-lg" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              aria-label="Next image"
            >
              <FaChevronRight className="text-lg" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image._id}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentIndex === index
                  ? "border-black scale-105 shadow-md"
                  : "border-gray-300 hover:border-gray-500 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                        <span class="text-gray-400 text-xs">❌</span>
                      </div>
                    `;
                  }
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

  const exteriorPhotos = vehicle.defaultPhotos?.exterior || [];
  const interiorPhotos = vehicle.defaultPhotos?.interior || [];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Images */}
          <div className="lg:w-1/2 w-full">
            <ImageCarousel
              images={exteriorPhotos}
              title="Exterior Photos"
              emptyMessage="No exterior photos available"
            />

            <ImageCarousel
              images={interiorPhotos}
              title="Interior Photos"
              emptyMessage="No interior photos available"
            />
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 w-full">
            {/* Title & Status */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                  vehicle.status === "available"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : vehicle.status === "rented"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : vehicle.status === "reserved"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {vehicle.status.charAt(0).toUpperCase() +
                  vehicle.status.slice(1)}
              </span>
            </div>

            {/* Station Location */}
            {station && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-red-500 mt-1 text-xl flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                      Current Location
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {station.location.address}
                    </p>
                    {station.code && (
                      <p className="text-xs text-gray-500 mt-2 bg-white/50 inline-block px-2 py-1 rounded">
                        Code: {station.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-4xl font-bold text-green-600">
                {vehicle.pricePerDay.toLocaleString()}đ
                <span className="text-lg text-gray-600 ml-2 font-normal">
                  /day
                </span>
              </p>
              <p className="text-xl text-gray-700 mt-2">
                {vehicle.pricePerHour.toLocaleString()}đ
                <span className="text-sm text-gray-500 ml-1 font-normal">
                  /hour
                </span>
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Plate Number
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {vehicle.plateNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Year</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {vehicle.year}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Color
                  </p>
                  <p className="font-bold text-gray-900 text-lg capitalize">
                    {vehicle.color}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Battery
                  </p>
                  <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <FaBatteryFull className="text-green-500" />
                    {vehicle.batteryCapacity}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Mileage
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Rating
                  </p>
                  <div className="flex items-center">
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
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed text-sm">
                This {vehicle.brand} {vehicle.model} ({vehicle.year}) is a
                premium electric vehicle offering exceptional performance and
                comfort. With a battery capacity of {vehicle.batteryCapacity}%
                and low mileage of {vehicle.mileage.toLocaleString()} km, it's
                perfect for both city commutes and long road trips. Experience
                the future of sustainable transportation.
              </p>
            </div>

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
                className={`flex-1 font-bold py-3.5 rounded-lg transition-all shadow-md ${
                  vehicle.status === "available"
                    ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg active:scale-95"
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
                className="flex-1 bg-gray-200 text-black font-bold py-3.5 rounded-lg hover:bg-gray-300 transition-all inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
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
